import { logger, slot, tts } from '../utils'
import { Handler } from './index'
import commonHandler, { KnownSlots } from './common'
import { getTournamentStandings, getTeamSchedule } from '../api';
const mapping = require('../../assets/teams_mapping')

export const leagueStandingHandler: Handler = async function (msg, flow, knownSlots: KnownSlots = { depth: 2 }) {
    logger.info('LeagueStanding')

    const {
        team,
        tournament,
        league
    } = await commonHandler(msg, knownSlots)

    if (slot.missing(team) && slot.missing(tournament) && slot.missing(league)) {
        throw new Error('intentNotRecognized')
    } else {
        const now = Date.now()

        // Searching for the id team
        const teamMapping = mapping.find(teamMapping => teamMapping.name.includes(team))
        if (!teamMapping) {
            throw new Error('team')
        }

        const teamId = teamMapping.id
        if (!teamId) {
            throw new Error('team')
        }

        logger.info(teamId)

        // API call
        const leagueData = await getTeamSchedule(teamId)
        logger.info(leagueData)

        try {

            const speech = `${ team } and ${ tournament } and ${ league }`
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