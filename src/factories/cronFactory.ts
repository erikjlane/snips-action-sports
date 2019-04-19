import {
    getSchedule, SchedulePayload
} from '../api/nba'
import fs from 'fs'
import cron from 'node-cron'

type Cacheable = {
    generated: Date
}

function init(cronOptions = {}) {
    // fetching the NBA schedule everyday at 10 AM and writing it in the cache
    const expression = '* * * * *'
    if (!cron.validate(expression)) {
        throw new Error('cron')
    }

    cron.schedule(expression, () => {
        getSchedule(true).then((data: SchedulePayload & Cacheable) => {
            // adding a date attribute
            data.generated = new Date()
            fs.writeFile('cache/nba_schedule.json', JSON.stringify(data), 'utf8', err => {
                console.log(err || 'CRON task executed')
            })
        })
    }, {
        timezone: 'America/New_York'
    })
}

export const cronFactory = {
    init
}
