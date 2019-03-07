import { httpFactory, configFactory } from '../factories'
import { LANGUAGE_MAPPINGS } from '../constants'
import { TournamentSchedulePayload } from './types'

export async function getTournamentSchedule (tournamentId: string) {
    const http = httpFactory.get()
    const config = configFactory.get()

    const results = await http
        .url(`/${ LANGUAGE_MAPPINGS[config.locale] }/tournaments/${ tournamentId }/schedule.json`)
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
        //TODO
    } else {
        throw new Error('APIResponse')
    }

    return results
}