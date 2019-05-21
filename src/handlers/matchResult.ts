import { slot, tts } from '../utils'
import { Handler,logger } from 'snips-toolkit'
import commonHandler, { KnownSlots } from './common'
import { soccerMatchResult } from './soccer'
import { nbaMatchResult } from './nba'
import { reader, Mappings } from '../utils/sports'
import { Hermes } from 'hermes-javascript'

export const matchResultHandler: Handler = async function (msg, flow, hermes: Hermes, knownSlots: KnownSlots = { depth: 2 }) {
    logger.info('MatchResult')

    const {
        teams,
        tournament
    } = await commonHandler(msg, knownSlots)

    if (slot.missing(teams) && slot.missing(tournament)) {
        throw new Error('intentNotRecognized')
    }

    const now: number = Date.now()
    const mappings: Mappings = reader(teams, tournament)

    if (!mappings.homogeneousness.homogeneous) {
        flow.end()
        return mappings.homogeneousness.message
    }

    try {
        let speech: string = ''

        const sportId = (mappings.tournament)
            ? mappings.tournament.sport.id
            : mappings.teams[0].sport.id

        switch (sportId) {
            // soccer
            case 'sr:sport:1': {
                speech = await soccerMatchResult(mappings)
                break
            }
            // basketball
            case 'sport:1': {
                speech = await nbaMatchResult(mappings)
                break
            }
        }

        logger.info(speech)
    
        flow.end()
        if (Date.now() - now < 4000) {
            return speech
        } else {
            tts.say(hermes, speech)
        }
    } catch (error) {
        logger.error(error)
        throw new Error('APIResponse')
    }
}
