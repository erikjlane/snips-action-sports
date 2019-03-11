import { logger } from '../utils'
import { Handler } from './index'
import commonHandler, { KnownSlots } from './common'

export const nextMatchHandler: Handler = async function (msg, flow, knownSlots: KnownSlots = { depth: 2 }) {
    logger.info('NextMatch')

    const {
        team,
        tournament
    } = await commonHandler(msg, knownSlots)

    const speech = `${ team } and ${ tournament }`
    logger.info(speech)

    flow.end()
    return speech
}
