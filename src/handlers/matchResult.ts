import { logger, slot, tts, translation } from '../utils'
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
import { i18nFactory } from '../factories'
import { reader } from '../utils/sports'

export const matchResultHandler: Handler = async function (msg, flow, knownSlots: KnownSlots = { depth: 2 }) {
    const i18n = i18nFactory.get()

    logger.info('MatchResult')

    const {
        teams,
        tournament
    } = await commonHandler(msg, knownSlots)

    // At least one required slot is missing
    const validTournament = !slot.missing(tournament)

    if (slot.missing(teams) && !validTournament) {
        throw new Error('intentNotRecognized')
    } else {
        const now: number = Date.now()

        let teamResults: TeamResultsPayload
        let teamsResults: TeamVsTeamPayload
        let tournamentResults: TournamentResultsPayload

        const {
            teamsId,
            tournamentId
        } = await reader(teams, tournament)

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
                    const inTournamentResults = teamResults.results.filter(
                        r => r.sport_event.tournament.id === tournamentId
                    )

                    if (inTournamentResults.length > 0) {
                        teamResults.results = inTournamentResults
                    } else {
                        speech += i18n('sports.dialog.teamNeverParticipatedInTournament', {
                            tournament
                        })
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
                        const inTournamentResults = teamsResults.last_meetings.results.filter(
                            r => r.sport_event.tournament.id === tournamentId
                        )

                        if (inTournamentResults.length > 0) {
                            teamsResults.last_meetings.results = inTournamentResults
                        } else {
                            speech += i18n('sports.dialog.teamsNeverMetInTournament', {
                                tournament
                            })
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