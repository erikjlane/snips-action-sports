import { configFactory } from '../factories'
import { time } from './time'

export const beautify = {    
    date: (date: Date): string => {
        const config = configFactory.get()

        const options = (time.wasThisWeek(date)) ? { weekday: 'long' } : {month: 'long', day: 'numeric'}

        if (config.locale === 'french') {
            // French
            return date.toLocaleDateString('fr-FR', options)
        } else {
            return date.toLocaleDateString('en-US', options)
        }
    },

    time: (date: Date): string => {
        const config = configFactory.get()

        if (config.locale === 'french') {
            // French
            return date.getHours() + 'h' + (date.getMinutes() < 10 ? '0' : '') + date.getMinutes()
        } else {
            // English
            const meridiem = (date.getHours() > 11) ? 'pm' : 'am'
            const hours = (meridiem === 'pm') ? date.getHours() - 12 : date.getHours()

            return hours + ':' + (date.getMinutes() < 10 ? '0' : '') + date.getMinutes() + ' ' + meridiem
        }
    }
}