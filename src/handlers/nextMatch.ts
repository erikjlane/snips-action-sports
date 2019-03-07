import { logger } from '../utils'
import { Handler } from './index'
import commonHandler, { KnownSlots } from './common'

export const nextMatchHandler: Handler = async function (msg, flow, knownSlots: KnownSlots = { depth: 2 }) {
    const {
        team,
        tournament,
        league
    } = await commonHandler(msg, knownSlots)

    const speech = `${ team } ${ tournament } ${ league }`
    logger.info(speech)

    flow.end()
    return speech
}
