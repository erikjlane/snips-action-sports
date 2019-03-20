import { logger, slot, tts, translation, message } from '../utils'
import { Handler } from './index'
import commonHandler, { KnownSlots } from './common'
import {
    getTeamResults,
    getTournamentResults,
    TeamResultsPayload,
    TournamentResultsPayload,
    getTeamVsTeam,
    TeamVsTeamPayload
} from '../api'
import {
    SLOT_CONFIDENCE_THRESHOLD,
    DAY_MILLISECONDS
} from '../constants'
import { slotType } from 'hermes-javascript'
const mapping = require('../../assets/mappings')
import { i18nFactory } from '../factories'

export const matchResultHandler: Handler = async function (msg, flow, knownSlots: KnownSlots = { depth: 2 }) {
    const i18n = i18nFactory.get()

    logger.info('MatchResult')

    const {
        teams,
        tournament
    } = await commonHandler(msg, knownSlots)

    // Get date_time specific slot
    let from: Date, to: Date

    if (!('from' in knownSlots)) {
        const timeIntervalSlot = message.getSlotsByName(msg, 'date_time', {
            onlyMostConfident: true,
            threshold: SLOT_CONFIDENCE_THRESHOLD
        })

        if (timeIntervalSlot) {
            // Is it a TimeInterval object?
            if (timeIntervalSlot.value.kind == slotType.timeInterval) {
                from = new Date(timeIntervalSlot.value.from)
                to = new Date(timeIntervalSlot.value.to)
            }
            // Or is it an InstantTime object?
            if (timeIntervalSlot.value.kind == slotType.instantTime) {
                from = new Date(timeIntervalSlot.value.value)
                to = new Date(from.getTime() + DAY_MILLISECONDS)
            }
        }
    } else {
        from = knownSlots.from
        to = knownSlots.to
    }

    logger.info('\tfrom: ', from)
    logger.info('\tto: ', to)

    // At least one required slot is missing
    const validTeam = !slot.missing(teams), validTournament = !slot.missing(tournament)

    if (!validTeam && !validTournament) {
        throw new Error('intentNotRecognized')
    } else {
        const now: number = Date.now()

        let teamsId: string[] = []
        let tournamentId: string
        let teamResults: TeamResultsPayload
        let teamsResults: TeamVsTeamPayload
        let tournamentResults: TournamentResultsPayload

        // Searching for the teams id
        if (validTeam) {
            for (let team of teams) {
                const matchingTeam = mapping.teams.find(t => t.name.includes(team))
                if (!matchingTeam || !matchingTeam.id) {
                    throw new Error('team')
                }
        
                teamsId.push(matchingTeam.id)
                logger.debug(matchingTeam.id)
            }
        }

        // Searching for the tournament id
        if (validTournament) {
            const matchingTournament = mapping.tournaments.find(t => t.name.includes(tournament))
            if (!matchingTournament || !matchingTournament.id) {
                throw new Error('tournament')
            }
    
            tournamentId = matchingTournament.id
            logger.debug(tournamentId)
        }

        try {
            let speech: string = ''
            
            // tournament only
            if (teams.length === 0) {
                tournamentResults = await getTournamentResults(tournamentId)
                tournamentResults.results = tournamentResults.results.filter(
                    r => r.sport_event_status.match_status === 'ended'
                )

                speech += translation.tournamentResultsToSpeech(tournamentResults)
            }
            
            // one team + optional tournament
            else if (teams.length === 1) {
                teamResults = await getTeamResults(teamsId[0])
                teamResults.results = teamResults.results.filter(
                    r => r.sport_event_status.match_status === 'ended'
                )

                if (validTournament) {
                    const results = teamResults.results.filter(r => r.sport_event.tournament.id === tournamentId)

                    if (results.length > 0) {
                        teamResults.results = results
                    } else {
                        speech += i18n('sports.dialog.teamNeverParticipatedInTournament', { tournament })
                        speech += ' '
                    }
                }

                speech += translation.teamResultToSpeech(teamResults.results[0], teamsId[0])
            } 

            // two teams + optional tournament
            else {
                teamsResults = await getTeamVsTeam(teamsId[0], teamsId[1])

                if (teamsResults.message && teamsResults.message === 'No meetings between these teams.') {
                    const speech = i18n('sports.dialog.teamsNeverMet')
                    flow.end()
                    logger.info(speech)
                    return speech
                } else {
                    teamsResults.last_meetings.results = teamsResults.last_meetings.results.filter(
                        r => r.sport_event_status.match_status === 'ended'
                    )

                    if (validTournament) {
                        const results = teamsResults.last_meetings.results.filter(
                            r => r.sport_event.tournament.id === tournamentId
                        )

                        if (results.length > 0) {
                            teamsResults.last_meetings.results = results
                        } else {
                            speech += i18n('sports.dialog.teamsNeverMetInTournament', { tournament })
                            speech += ' '
                        }
                    }

                    speech += translation.teamResultToSpeech(teamsResults.last_meetings.results[0], teamsId[0])
                }
            }

            logger.info(speech)
        
            flow.end()
            if (Date.now() - now < 4000) {
                return speech
            } else {
                tts.say(speech)
            }
        } catch (error) {
            logger.error(error)
            throw new Error('APIResponse')
        }
    }
}