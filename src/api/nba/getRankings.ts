import { config, logger } from 'snips-toolkit'
import { RankingsPayload } from './types'
import { request } from '../index'

export async function getRankings(): Promise<RankingsPayload> {
    const http = request.query({
        api_key: config.get().nbaApiKey
    })

    const results = await http
        .url(`/nba/trial/v5/${ config.get().locale }/seasons/2018/REG/rankings.json`)
        .get()
        .json()
        .catch(error => {
            logger.error(error)
            // Network error
            if (error.name === 'TypeError')
                throw new Error('APIRequest')
            // Other error
            throw new Error('APIResponse')
        }) as RankingsPayload

    if (results) {
        //logger.debug(results)
    } else {
        throw new Error('APIResponse')
    }

    return results
}
