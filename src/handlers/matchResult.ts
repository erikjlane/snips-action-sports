import { logger, slot, tts } from '../utils'
import { Handler } from './index'
import commonHandler, { KnownSlots } from './common'
import { soccerMatchResult } from './soccer'
import { nbaMatchResult } from './nba'
import { reader } from '../utils/sports'

export const matchResultHandler: Handler = async function (msg, flow, knownSlots: KnownSlots = { depth: 2 }) {
    logger.info('MatchResult')

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
                tts.say(speech)
            }
        } catch (error) {
            logger.error(error)
            throw new Error('APIResponse')
        }
    }
}