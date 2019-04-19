import { httpFactory, configFactory } from '../../factories'
import { LANGUAGE_MAPPINGS } from '../../constants'
import { logger } from '../../utils'
import { SchedulePayload } from './types'
import fs from 'fs'

export async function getSchedule(forceRefresh: boolean = false): Promise<SchedulePayload> {
    const config = configFactory.get()

    let results: SchedulePayload

    const cached = fs.readFileSync('cache/nba_schedule.json', 'utf8')
    if (!forceRefresh && cached) {
        results = JSON.parse(cached)
    } else {
        const http = httpFactory.get().query({
            api_key: configFactory.get().nbaApiKey
        })
    
        results = await http
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
            //logger.debug(results)
        } else {
            throw new Error('APIResponse')
        }
    }

    return results
}
