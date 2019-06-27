import { Hermes, Done } from 'hermes-javascript'
import { config, i18n, logger } from 'snips-toolkit'
import handlers from './handlers'
import { cronFactory } from './factories'

// Enables deep printing of objects.
process.env.DEBUG_DEPTH = undefined

export default async function ({
    hermes,
    done
}: {
    hermes: Hermes,
    done: Done
}) {
    try {
        const { name } = require('../package.json')
        logger.init(name)
        // Replace 'error' with '*' to log everything
        logger.enable('error')

        config.init()
        await i18n.init(config.get().locale)
        cronFactory.init()

        const dialog = hermes.dialog()

        // Subscribe to the app intents
        dialog.flows([
            {
                intent: `${ config.get().assistantPrefix }:NextMatch`,
                action: (msg, flow) => handlers.nextMatch(msg, flow, hermes)
            },
            {
                intent: `${ config.get().assistantPrefix }:TournamentStanding`,
                action: (msg, flow) => handlers.tournamentStanding(msg, flow, hermes)
            },
            {
                intent: `${ config.get().assistantPrefix }:MatchResult`,
                action: (msg, flow) => handlers.matchResult(msg, flow, hermes)
            }
        ])
    } catch (error) {
        // Output initialization errors to stderr and exit
        const message = await i18n.errorMessage(error)
        logger.error(message)
        logger.error(error)
        // Exit
        done()
    }
}
