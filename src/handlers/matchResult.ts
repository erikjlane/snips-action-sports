import { logger, slot, tts, translation } from '../utils'
import { Handler } from './index'
import commonHandler, { KnownSlots } from './common'
import { getTeamResults, getTournamentResults, TeamResultsPayload, TournamentResultsPayload } from '../api'
const mapping = require('../../assets/mappings')

export const matchResultHandler: Handler = async function (msg, flow, knownSlots: KnownSlots = { depth: 2 }) {
    logger.info('MatchResult')

    const {
        team,
        tournament
    } = await commonHandler(msg, knownSlots)

    const validTeam = !slot.missing(team), validTournament = !slot.missing(tournament)

    if (!validTeam && !validTournament) {
        throw new Error('intentNotRecognized')
    } else {
        const now = Date.now()

        let teamId
        let tournamentId
        let teamResultsData: TeamResultsPayload
        let tournamentResultsData: TournamentResultsPayload

        // Searching for the team id
        if (validTeam) {
            const matchingTeam = mapping.teams.find(teamMapping => teamMapping.name.includes(team))
            if (!matchingTeam) {
                throw new Error('team')
            }
    
            teamId = matchingTeam.id
            if (!teamId) {
                throw new Error('team')
            }
    
            logger.info(teamId)
        }

        // Searching for the tournament id
        if (validTournament) {
            const matchingTournament = mapping.tournaments.find(tournamentMapping => tournamentMapping.name.includes(tournament))
            if (!matchingTournament) {
                throw new Error('tournament')
            }
    
            tournamentId = matchingTournament.id
            if (!tournamentId) {
                throw new Error('tournament')
            }
    
            logger.info(tournamentId)
        }

        try {
            let speech = ''

            // only team
            if (validTeam && !validTournament) {
                teamResultsData = await getTeamResults(teamId)
                logger.info(teamResultsData)
                
                speech = translation.teamResultToSpeech(teamResultsData.results[0])
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