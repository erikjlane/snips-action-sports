const { configFactory } = require('../factories')

export const beautify = {    
    date: date => {
        const config = configFactory.get()
        const options = {month: 'long', day: 'numeric'}

        if (config.locale === 'french') {
            // French
            return date.toLocaleDateString('fr-FR', options)
        } else {
            return date.toLocaleDateString('en-US', options)
        }
    }
}