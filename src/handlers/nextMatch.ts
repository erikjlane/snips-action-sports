import { logger, slot, tts } from '../utils'
import { Handler } from './index'
import commonHandler, { KnownSlots } from './common'
import { soccerNextMatch } from './soccer'
import { nbaNextMatch } from './nba'
import { reader } from '../utils/sports'

export const nextMatchHandler: Handler = async function (msg, flow, knownSlots: KnownSlots = { depth: 2 }) {
    logger.info('NextMatch')

    const {
        teams,
        tournament
    } = await commonHandler(msg, knownSlots)

    if (slot.missing(teams) && slot.missing(tournament)) {
        throw new Error('intentNotRecognized')
    } else {
        const now: number = Date.now()

        const mappings = reader(teams, tournament)

        try {
            let speech: string = ''

            switch (mappings.sport.id) {
                // soccer
                case 'sr:sport:1': {
                    speech = await soccerNextMatch(mappings)
                    break
                }
                // basketball
                case 'sport:1': {
                    speech = await nbaNextMatch(mappings)
                    break
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
