import { handler, ConfidenceThresholds } from 'snips-toolkit'
import { nextMatchHandler } from './nextMatch'
import { matchResultHandler } from './matchResult'
import { tournamentStandingHandler } from './tournamentStanding'
import { INTENT_PROBABILITY_THRESHOLD, ASR_UTTERANCE_CONFIDENCE_THRESHOLD } from '../constants'

const thresholds: ConfidenceThresholds = {
    intent: INTENT_PROBABILITY_THRESHOLD,
    asr: ASR_UTTERANCE_CONFIDENCE_THRESHOLD
}

// Add handlers here, and wrap them.
export default {
    nextMatch: handler.wrap(nextMatchHandler, thresholds),
    matchResult: handler.wrap(matchResultHandler, thresholds),
    tournamentStanding: handler.wrap(tournamentStandingHandler, thresholds)
}
