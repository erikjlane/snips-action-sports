import wretch, { Wretcher } from 'wretch'
import { dedupe } from 'wretch-middlewares'

const BASE_URL = 'https://api.sportradar.us'

let http = wretch(BASE_URL)
    .middlewares([
        dedupe()
    ])

function init(httpOptions = { mock: false }) {
    http = http.polyfills({
        fetch: httpOptions.mock || require('node-fetch')
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
function get(): Wretcher {
    return http
}

export const httpFactory = {
    init,
    get
}
