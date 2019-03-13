import { WEEK_MILLISECONDS } from '../constants'

export const time = {
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