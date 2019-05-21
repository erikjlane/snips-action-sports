import { TournamentSchedulePayload } from './types'
import { config } from 'snips-toolkit'
import { request } from '../index'

export async function getTournamentSchedule (tournamentId: string): Promise<TournamentSchedulePayload> {
    const http = request.query({
        api_key: config.get().soccerApiKey
    })

    const results = await http
        .url(`/soccer-t3/eu/${ config.get().locale }/tournaments/${ tournamentId }/schedule.json`)
        .get()
        .json()
        .catch(error => {
            // Network error
            if (error.name === 'TypeError')
                throw new Error('APIRequest')
            // Other error
            throw new Error('APIResponse')
        }) as TournamentSchedulePayload

    if (results) {
        //logger.debug(results)
    } else {
        throw new Error('APIResponse')
    }

    return results
}
