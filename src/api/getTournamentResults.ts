import { httpFactory, configFactory } from '../factories'
import { LANGUAGE_MAPPINGS } from '../constants'
import { TournamentResultsPayload } from './types'
import { logger } from '../utils'

export async function getTournamentResults (tournamentId: string): Promise<TournamentResultsPayload> {
    const http = httpFactory.get()
    const config = configFactory.get()

    const request = http
        .url(`/${ LANGUAGE_MAPPINGS[config.locale] }/tournaments/${ tournamentId }/results.json`)

    logger.debug(request)

    try {
        const results = await request.get()

        logger.info(results.res)
        logger.info(results.json)
        logger.debug(results)

        const results2 = results.json()
        .catch(error => {
            logger.error(error)
            // Network error
            if (error.name === 'TypeError')
                throw new Error('APIRequest')
            // Other error
            throw new Error('APIResponse')
        })

        console.log(results2)
        logger.debug(results2)

        if (results2) {
            //TODO
        } else {
            throw new Error('APIResponse')
        }
    
        return results2 as TournamentResultsPayload
    } catch (e) {
        logger.debug(e)
    }
}