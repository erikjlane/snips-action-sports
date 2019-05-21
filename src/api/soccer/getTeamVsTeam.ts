import { TeamVsTeamPayload } from './types'
import { config } from 'snips-toolkit'
import { request } from '../index'

export async function getTeamVsTeam (team1Id: string, team2Id: string): Promise<TeamVsTeamPayload> {
    const http = request.query({
        api_key: config.get().soccerApiKey
    })

    const results = await http
        .url(`/soccer-t3/eu/${ config.get().locale }/teams/${ team1Id }/versus/${ team2Id }/matches.json`)
        .get()
        .json()
        .catch(error => {
            // Network error
            if (error.name === 'TypeError')
                throw new Error('APIRequest')
            // Other error
            throw new Error('APIResponse')
        }) as TeamVsTeamPayload

    if (results) {
        //logger.debug(results)
    } else {
        throw new Error('APIResponse')
    }

    return results
}
