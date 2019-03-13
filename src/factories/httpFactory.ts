import wretch from 'wretch'
import { dedupe, throttlingCache } from 'wretch-middlewares'
import { HOUR_MILLISECONDS } from '../constants'
import { configFactory } from './configFactory'

const BASE_URL = 'https://api.sportradar.us/soccer-t3/eu'

let http = wretch(BASE_URL)
    .middlewares([
        dedupe()
    ])

function init(httpOptions = { mock: false }) {
    http = http.polyfills({
        fetch: httpOptions.mock || require('node-fetch')
    }).query({
        api_key: configFactory.get().apiKey
    })

    if (!httpOptions.mock) {
        // https://github.com/bitinn/node-fetch/issues/151
        /*
        http = http.middlewares([
            throttlingCache({
                throttle: HOUR_MILLISECONDS / 6
            })
        ])
        */
    }
}
function get() {
    return http
}

export const httpFactory = {
    init,
    get
}
