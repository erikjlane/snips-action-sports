import {
    getSchedule, SchedulePayload
} from '../api/nba'
import fs from 'fs'
import cron from 'node-cron'
import { DAY_MILLISECONDS } from '../constants'
import { logger } from '../utils'

const CACHE_DIR = __dirname + '/../../cache'

export type Cacheable = {
    generated: Date
}

function isValid(cached: Cacheable) {
    return cached && cached.generated && new Date(cached.generated).getTime() + DAY_MILLISECONDS > new Date().getTime()
}

function init() {
    if (!fs.existsSync(CACHE_DIR)){
        fs.mkdirSync(CACHE_DIR);
    }

    cronGetNBASchedule()
}

function cronGetNBASchedule() {
    // fetching the NBA schedule everyday at 10 AM and writing it in the cache
    const expression = '0 10 * * *'
    if (!cron.validate(expression)) {
        throw new Error('cron')
    }

    cron.schedule(expression, () => {
        getSchedule(true).then((data: SchedulePayload & Cacheable) => {
            // adding a date attribute
            data.generated = new Date()
            fs.writeFile(CACHE_DIR + '/nba_schedule.json', JSON.stringify(data), 'utf8', err => {
                logger.debug(err || 'CRON task executed')
            })
        })
    }, {
        timezone: 'America/New_York'
    })
}

export const cronFactory = {
    init,
    isValid
}
