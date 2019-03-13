import { configFactory } from '../factories'
import { time } from './time'

export const beautify = {    
    date: date => {
        const config = configFactory.get()

        const options = (time.wasThisWeek(date)) ? { weekday: 'long' } : {month: 'long', day: 'numeric'}

        if (config.locale === 'french') {
            // French
            return date.toLocaleDateString('fr-FR', options)
        } else {
            return date.toLocaleDateString('en-US', options)
        }
    }
}