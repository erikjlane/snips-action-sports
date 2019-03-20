import { configFactory } from '../factories'
import { time } from './time'

export const beautify = {    
    date: (date: Date): string => {
        const config = configFactory.get()
        const options = (time.wasThisWeek(date))
            ? { weekday: 'long' }
            : { month: 'long', day: 'numeric' }

        if (config.locale === 'french') {
            // French
            return date.toLocaleString('fr-FR', options)
        } else {
            // English
            return date.toLocaleString('en-US', options)
        }
    },

    time: (date: Date): string => {
        const config = configFactory.get()
        const options = { hour: 'numeric', minute: 'numeric' }

        if (config.locale === 'french') {
            // French
            return date.toLocaleString('fr-FR', {
                ...options,
                hour12: false
            }).replace(':', ' heure ').replace(' 00', '')
        } else {
            // English
            return date.toLocaleString('en-US', {
                ...options,
                hour12: true
            }).replace(':', ' ').replace(' 00','')
        }
    }
}