import { httpFactory, configFactory } from '../../factories'
import { LANGUAGE_MAPPINGS } from '../../constants'
import { logger } from '../../utils'

export async function getRankings () {
    const config = configFactory.get()

    const http = httpFactory.get().query({
        api_key: configFactory.get().nbaApiKey
    })

    const results = await http
        .url(`/nba/trial/v5/${ LANGUAGE_MAPPINGS[config.locale] }/seasons/2018/REG/rankings.json`)
        .get()
        .json()
        .catch(error => {
            logger.error(error)
            // Network error
            if (error.name === 'TypeError')
                throw new Error('APIRequest')
            // Other error
            throw new Error('APIResponse')
        })

    if (results) {
        logger.debug(results)
    } else {
        throw new Error('APIResponse')
    }

    return results
}