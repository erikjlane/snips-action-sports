import { logger } from '../utils'
import { Handler } from './index'
import commonHandler from './common'

export const matchResultHandler: Handler = async function (msg, flow, knownSlots = { depth: 2 }) {
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