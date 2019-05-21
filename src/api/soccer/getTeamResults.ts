import { TeamResultsPayload } from './types'
import { logger, config } from 'snips-toolkit'
import { request } from '../index'

export async function getTeamResults (teamId: string): Promise<TeamResultsPayload> {
    const http = request.query({
        api_key: config.get().soccerApiKey
    })
    
    const results = await http
        .url(`/soccer-t3/eu/${ config.get().locale }/teams/${ teamId }/results.json`)
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
