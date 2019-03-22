import { httpFactory, configFactory } from '../../factories'
import { LANGUAGE_MAPPINGS } from '../../constants'
import { TeamResultsPayload } from './types'
import { logger } from '../../utils'

export async function getTeamResults (teamId: string): Promise<TeamResultsPayload> {
    const config = configFactory.get()

    const http = httpFactory.get().query({
        api_key: configFactory.get().soccerApiKey
    })
    
    const results = await http
        .url(`/soccer-t3/eu/${ LANGUAGE_MAPPINGS[config.locale] }/teams/${ teamId }/results.json`)
        .get()
        .json()
        .catch(error => {
            logger.error(error)
            // Network error
            if (error.name === 'TypeError')
                throw new Error('APIRequest')
            // Other error
            throw new Error('APIResponse')
        }) as TeamResultsPayload

    if (results) {
        //logger.debug(results)
    } else {
        throw new Error('APIResponse')
    }

    return results
}