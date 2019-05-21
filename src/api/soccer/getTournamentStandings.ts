import { TournamentStandingsPayload } from './types'
import { config } from 'snips-toolkit'
import { request } from '../index'

export async function getTournamentStandings (tournamentId: string): Promise<TournamentStandingsPayload> {
    const http = request.query({
        api_key: config.get().soccerApiKey
    })

    const results = await http
        .url(`/soccer-t3/eu/${ config.get().locale }/tournaments/${ tournamentId }/standings.json`)
        .get()
        .json()
        .catch(error => {
            // Network error
            if (error.name === 'TypeError')
                throw new Error('APIRequest')
            // Not in progress error
            if (JSON.parse(error.message).message === 'No standings for this tournament.') {
                let error = new Error('notInProgress')
                error.name = 'NotInProgressError'
                throw error
            }
            // Other error
            throw new Error('APIResponse')
        }) as TournamentStandingsPayload

    if (results) {
        //logger.debug(results)
    } else {
        throw new Error('APIResponse')
    }

    return results
}
