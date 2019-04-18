import { WEEK_MILLISECONDS } from '../constants'

export const time = {
    areSameDays (date1: Date, date2: Date) {
        date1.setHours(0, 0, 0, 0)
        date2.setHours(0, 0, 0, 0)

        return date1.getTime() === date2.getTime()
    },

    wasThisWeek (date: Date) {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const interval = {
            min: today.getTime() - WEEK_MILLISECONDS,
            max: today.getTime()
        }

        return date.getTime() >= interval.min && date.getTime() <= interval.max
    }
}