import { withHermes } from 'hermes-javascript'
import bootstrap from './bootstrap'
import handlers from './handlers'
import { translation, logger } from './utils'

// Initialize hermes
export default function ({
    hermesOptions = {},
    bootstrapOptions = {}
} = {}) : Promise<() => void>{
    return new Promise((resolve, reject) => {
        withHermes(async (hermes, done) => {
            try {
                // Bootstrap config, locale, i18n…
                await bootstrap(bootstrapOptions)
        
                const dialog = hermes.dialog()
        
                dialog.flows([
                    {
                        intent: 'snips-assistant:NextMatch',
                        action: handlers.nextMatch
                    },
                    {
                        intent: 'snips-assistant:TournamentStanding',
                        action: handlers.tournamentStanding
                    },
                    {
                        intent: 'snips-assistant:MatchResult',
                        action: handlers.matchResult
                    }
                ])
                resolve(done)
            } catch (error) {
                // Output initialization errors to stderr and exit
                const message = await translation.errorMessage(error)
                logger.error(message)
                logger.error(error)
                // Exit
                done()
                // Reject
                reject(error)
            }
        }, hermesOptions)
    })
}