import { httpFactory, configFactory } from '../factories'
import { LANGUAGE_MAPPINGS } from '../constants'
import { TeamSchedulePayload } from './types'

export async function getTeamSchedule (teamId: string) {
    const http = httpFactory.get()
    const config = configFactory.get()

    const results = await http
        .url(`/${ LANGUAGE_MAPPINGS[config.locale] }/teams/${ teamId }/schedule.json`)
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
        
    } else {
        throw new Error('APIResponse')
    }

    return results
}