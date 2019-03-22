import { httpFactory, configFactory } from '../../factories'
import { LANGUAGE_MAPPINGS } from '../../constants'
import { TournamentStandingsPayload } from './types'
import { logger } from '../../utils'

export async function getTournamentStandings (tournamentId: string): Promise<TournamentStandingsPayload> {
    const config = configFactory.get()

    const http = httpFactory.get().query({
        api_key: configFactory.get().soccerApiKey
    })

    const results = await http
        .url(`/soccer-t3/eu/${ LANGUAGE_MAPPINGS[config.locale] }/tournaments/${ tournamentId }/standings.json`)
        .get()
        .json()
        .catch(error => {
            logger.error(error)
            // Network error
            if (error.name === 'TypeError')
                throw new Error('APIRequest')
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