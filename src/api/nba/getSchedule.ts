import { httpFactory, configFactory, cronFactory, Cacheable } from '../../factories'
import { LANGUAGE_MAPPINGS } from '../../constants'
import { logger } from '../../utils'
import { SchedulePayload } from './types'
import fs from 'fs'

export async function getSchedule(forceRefresh: boolean = false): Promise<SchedulePayload> {
    const config = configFactory.get()

    try {
        const cached = fs.readFileSync('cache/nba_schedule.json', 'utf8')
        if (!forceRefresh && cached) {
            const results: SchedulePayload & Cacheable = JSON.parse(cached)
            if (cronFactory.isValid(results)) {
                logger.debug('Reading from cache')
                return results
            }
        }
    } catch (err) {
        logger.error(err)
    }

    logger.debug('No cache used')

    const http = httpFactory.get().query({
        api_key: configFactory.get().nbaApiKey
    })

    const results = await http
        .url(`/nba/trial/v5/${ LANGUAGE_MAPPINGS[config.locale] }/games/2018/REG/schedule.json`)
        .get()
        .json()
        .catch(error => {
            logger.error(error)
            // Network error
            if (error.name === 'TypeError')
                throw new Error('APIRequest')
            // Other error
            throw new Error('APIResponse')
        }) as SchedulePayload

    if (results) {
        if (!forceRefresh) {
            cronFactory.writeNBAScheduleToCache(results as SchedulePayload & Cacheable)
        }
        //logger.debug(results)
    } else {
        throw new Error('APIResponse')
    }

    return results
}
