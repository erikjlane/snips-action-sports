import { httpFactory, configFactory } from '../factories'
import { LANGUAGE_MAPPINGS } from '../constants'
import { TeamVsTeamPayload } from './types'

export async function getTeamVsTeam (team1Id: string, team2Id: string) {
    const http = httpFactory.get()
    const config = configFactory.get()

    const results = await http
        .url(`/${ LANGUAGE_MAPPINGS[config.locale] }/teams/${ team1Id }/versus/${ team2Id }/matches.json`)
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
        //TODO
    } else {
        throw new Error('APIResponse')
    }

    return results
}