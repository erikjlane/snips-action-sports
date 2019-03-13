import { httpFactory, configFactory } from '../factories'
import { LANGUAGE_MAPPINGS } from '../constants'
import { TournamentResultsPayload } from './types'
import { logger } from '../utils'

export async function getTournamentResults (tournamentId: string): Promise<TournamentResultsPayload> {
    const http = httpFactory.get()
    const config = configFactory.get()

    const request = http
        .url(`/${ LANGUAGE_MAPPINGS[config.locale] }/tournaments/${ tournamentId }/results.json`)

    console.log(request)

    const results = await request
        .get()
        .json()
        .catch(error => {
            logger.error(error)
            // Network error
            if (error.name === 'TypeError')
                throw new Error('APIRequest')
            // Other error
            throw new Error('APIResponse')
        }) as TournamentResultsPayload
    
    console.log('apres')

    if (results) {
        //TODO
    } else {
        throw new Error('APIResponse')
    }

    return results
}