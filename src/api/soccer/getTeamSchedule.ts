import { TeamSchedulePayload } from './types'
import { config } from 'snips-toolkit'
import { request } from '../index'

export async function getTeamSchedule (teamId: string): Promise<TeamSchedulePayload> {
    const http = request.query({
        api_key: config.get().soccerApiKey
    })

    const results = await http
        .url(`/soccer-t3/eu/${ config.get().locale }/teams/${ teamId }/schedule.json`)
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
