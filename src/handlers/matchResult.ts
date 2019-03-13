import { logger, slot, tts, translation, message } from '../utils'
import { Handler } from './index'
import commonHandler, { KnownSlots } from './common'
import { getTeamResults, getTournamentResults, TeamResultsPayload, TournamentResultsPayload, Result } from '../api'
import {
    SLOT_CONFIDENCE_THRESHOLD,
    DAY_MILLISECONDS
} from '../constants'
import { slotType } from 'hermes-javascript';
const mapping = require('../../assets/mappings')

export const matchResultHandler: Handler = async function (msg, flow, knownSlots: KnownSlots = { depth: 2 }) {
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
        let teamResultsData: TeamResultsPayload
        let tournamentResultsData: TournamentResultsPayload

        // Searching for the teams id
        if (validTeam) {
            for (let team of teams) {
                const matchingTeam = mapping.teams.find(teamMapping => teamMapping.name.includes(team))
                if (!matchingTeam || !matchingTeam.id) {
                    throw new Error('team')
                }
        
                teamsId.push(matchingTeam.id)
                logger.debug(matchingTeam.id)
            }
        }

        // Searching for the tournament id
        if (validTournament) {
            const matchingTournament = mapping.tournaments.find(tournamentMapping => tournamentMapping.name.includes(tournament))
            if (!matchingTournament || !matchingTournament.id) {
                throw new Error('tournament')
            }
    
            tournamentId = matchingTournament.id
            logger.debug(tournamentId)
        }

        try {
            let speech: string = ''

            // only team(s)
            if (validTeam && !validTournament) {
                teamResultsData = await getTeamResults(teamsId[0])
                logger.info(teamResultsData)
                
                if (teams.length === 1) {
                    // one team is provided, searching for the last result
                    speech = translation.teamResultToSpeech(teamResultsData.results[0], from, to)
                } else {
                    // two teams are provided, searching for the correct result
                    const matchingResult: Result = teamResultsData.results.find(
                        resultMapping => resultMapping.sport_event.competitors.filter(
                            competitor => teamsId.includes(competitor.id)
                        ).length === 2
                    )

                    if (!matchingResult) {
                        throw new Error('teamsNotCompetitors')
                    } else {
                        speech = translation.teamResultToSpeech(matchingResult, from, to)
                    }
                }
            }
            
            // only tournament
            if (validTournament && !validTeam) {
                tournamentResultsData = await getTournamentResults(tournamentId)
                logger.info(tournamentResultsData)

                speech = translation.tournamentResultsToSpeech(tournamentResultsData.results)
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