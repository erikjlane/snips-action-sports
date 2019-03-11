import { logger, slot, tts, translation } from '../utils'
import { Handler } from './index'
import commonHandler, { KnownSlots } from './common'
import { getTeamResults, TeamResultsPayload } from '../api'
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
        let teamResultsData: TeamResultsPayload

        // Searching for the id team
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

        // API call
        teamResultsData = await getTeamResults(teamId)
        logger.info(teamResultsData)

        try {
            const speech = translation.teamResultsToSpeech(team, tournament, teamResultsData)
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