import { logger, slot, tts, translation } from '../utils'
import { Handler } from './index'
import commonHandler, { KnownSlots } from './common'
import { getTeamResults, TeamResultsPayload } from '../api'
const mapping = require('../../assets/mappings')

export const nextMatchHandler: Handler = async function (msg, flow, knownSlots: KnownSlots = { depth: 2 }) {
    logger.info('NextMatch')

    const {
        teams,
        tournament
    } = await commonHandler(msg, knownSlots)

    const validTeam = !slot.missing(teams), validTournament = !slot.missing(tournament)

    if (!validTeam && !validTournament) {
        throw new Error('intentNotRecognized')
    } else {
        const now = Date.now()

        let teamsId: string[] = []
        let teamResultsData: TeamResultsPayload

        // Searching for the id team
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

        // API call
        teamResultsData = await getTeamResults(teamsId[0])
        logger.info(teamResultsData)

        try {
            const speech = translation.teamResultToSpeech(teamResultsData.results[0])
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
