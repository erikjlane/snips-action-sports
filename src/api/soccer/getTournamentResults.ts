import { TournamentResultsPayload } from './types'
import { config } from 'snips-toolkit'
import { request } from '../index'

export async function getTournamentResults (tournamentId: string): Promise<TournamentResultsPayload> {
    const http = request.query({
        api_key: config.get().soccerApiKey
    })

    const results = await http
        .url(`/soccer-t3/eu/${ config.get().locale }/tournaments/${ tournamentId }/results.json`)
        .get()
        .json()
        .catch(error => {
            // Network error
            if (error.name === 'TypeError')
                throw new Error('APIRequest')
            // Other error
            throw new Error('APIResponse')
        }) as TournamentResultsPayload

    if (results) {
        //logger.debug(results)
    } else {
        throw new Error('APIResponse')
    }

    return results
}
