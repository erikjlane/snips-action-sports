import { httpFactory, configFactory } from '../../factories'
import { LANGUAGE_MAPPINGS } from '../../constants'
import { TournamentSchedulePayload } from './types'

export async function getTournamentSchedule (tournamentId: string): Promise<TournamentSchedulePayload> {
    const config = configFactory.get()

    const http = httpFactory.get().query({
        api_key: configFactory.get().soccerApiKey
    })

    const results = await http
        .url(`/soccer-t3/eu/${ LANGUAGE_MAPPINGS[config.locale] }/tournaments/${ tournamentId }/schedule.json`)
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