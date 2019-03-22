import { httpFactory, configFactory } from '../../factories'
import { LANGUAGE_MAPPINGS } from '../../constants'
import { TeamSchedulePayload } from './types'

export async function getTeamSchedule (teamId: string): Promise<TeamSchedulePayload> {
    const config = configFactory.get()

    const http = httpFactory.get().query({
        api_key: configFactory.get().soccerApiKey
    })

    const results = await http
        .url(`/soccer-t3/eu/${ LANGUAGE_MAPPINGS[config.locale] }/teams/${ teamId }/schedule.json`)
        .get()
        .json()
        .catch(error => {
            // Network error
            if (error.name === 'TypeError')
                throw new Error('APIRequest')
            // Other error
            throw new Error('APIResponse')
        }) as TeamSchedulePayload

    if (results) {
        //logger.debug(results)
    } else {
        throw new Error('APIResponse')
    }

    return results
}