import { cronFactory, Cacheable } from '../../factories'
import { logger, config } from 'snips-toolkit'
import { SchedulePayload } from './types'
import fs from 'fs'
import { request } from '../index'

export async function getSchedule(forceRefresh: boolean = false): Promise<SchedulePayload> {
    try {
        const cached = fs.readFileSync('.cache/nba_schedule.json', 'utf8')
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

    const http = request.query({
        api_key: config.get().nbaApiKey
    })

    const results = await http
        .url(`/nba/trial/v5/${ config.get().locale }/games/2018/REG/schedule.json`)
        .get()
        .json()
        .catch(error => {
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
