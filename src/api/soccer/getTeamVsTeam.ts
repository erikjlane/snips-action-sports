import { httpFactory, configFactory } from '../../factories'
import { LANGUAGE_MAPPINGS } from '../../constants'
import { TeamVsTeamPayload } from './types'
import { logger } from '../../utils'

export async function getTeamVsTeam (team1Id: string, team2Id: string): Promise<TeamVsTeamPayload> {
    const config = configFactory.get()

    const http = httpFactory.get().query({
        api_key: configFactory.get().soccerApiKey
    })

    const request = http
        .url(`/soccer-t3/eu/${ LANGUAGE_MAPPINGS[config.locale] }/teams/${ team1Id }/versus/${ team2Id }/matches.json`)

    logger.debug(request)

    const results = await request
        .get()
        .json()
        .catch(error => {
            logger.error(error)
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