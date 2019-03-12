import { logger, slot, tts, translation } from '../utils'
import { Handler } from './index'
import commonHandler, { KnownSlots } from './common'
import { getTeamResults, getTournamentResults, TeamResultsPayload, TournamentResultsPayload, Result } from '../api'
const mapping = require('../../assets/mappings')

export const matchResultHandler: Handler = async function (msg, flow, knownSlots: KnownSlots = { depth: 2 }) {
    logger.info('MatchResult')

    const {
        teams,
        tournament
    } = await commonHandler(msg, knownSlots)

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
                logger.info(matchingTeam.id)
            }
        }

        // Searching for the tournament id
        if (validTournament) {
            const matchingTournament = mapping.tournaments.find(tournamentMapping => tournamentMapping.name.includes(tournament))
            if (!matchingTournament || !matchingTournament.id) {
                throw new Error('tournament')
            }
    
            tournamentId = matchingTournament.id
            logger.info(tournamentId)
        }

        try {
            let speech: string = ''

            // only team(s)
            if (validTeam && !validTournament) {
                teamResultsData = await getTeamResults(teamsId[0])
                logger.info(teamResultsData)
                
                if (teams.length === 1) {
                    speech = translation.teamResultToSpeech(teamResultsData.results[0])
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
                        speech = translation.teamResultToSpeech(matchingResult)
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