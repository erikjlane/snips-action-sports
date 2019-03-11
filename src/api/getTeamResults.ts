import { httpFactory, configFactory } from '../factories'
import { LANGUAGE_MAPPINGS } from '../constants'
import { TeamResultsPayload } from './types'

export async function getTeamResults (teamId: string) {
    const http = httpFactory.get()
    const config = configFactory.get()

    const results = await http
        .url(`/${ LANGUAGE_MAPPINGS[config.locale] }/teams/${ teamId }/results.json`)
        .get()
        .json()
        .catch(error => {
            // Network error
            if (error.name === 'TypeError')
                throw new Error('APIRequest')
            // Other error
            throw new Error('APIResponse')
        }) as TeamResultsPayload

    if (results) {
        //TODO
    } else {
        throw new Error('APIResponse')
    }

    return results
}