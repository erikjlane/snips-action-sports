import { logger, slot, tts } from '../utils'
import { Handler } from './index'
import commonHandler, { KnownSlots } from './common'
import { soccerTournamentStanding } from './soccer'
import { INTENT_FILTER_PROBABILITY_THRESHOLD } from '../constants'
import { reader } from '../utils/sports'
import { i18nFactory } from '../factories'

export const tournamentStandingHandler: Handler = async function (msg, flow, knownSlots: KnownSlots = { depth: 2 }) {
    const i18n = i18nFactory.get()

    logger.info('TournamentStanding')

    const {
        teams,
        tournament
    } = await commonHandler(msg, knownSlots)

    // for now, the tournament is required
    if (slot.missing(tournament)) {
        if (knownSlots.depth === 0) {
            throw new Error('slotsNotRecognized')
        }

        /*
        flow.notRecognized((msg, flow) => {
            knownSlots.depth -= 1
            return tournamentStandingHandler(msg, flow, knownSlots)
        })
        */
        
        flow.continue('snips-assistant:TournamentStanding', (msg, flow) => {
            if (msg.intent.confidenceScore < INTENT_FILTER_PROBABILITY_THRESHOLD) {
                throw new Error('intentNotRecognized')
            }
            
            let slotsToBeSent = {
                teams,
                depth: knownSlots.depth - 1
            }

            return tournamentStandingHandler(msg, flow, slotsToBeSent)
        })

        flow.continue('snips-assistant:Cancel', (_, flow) => {
            flow.end()
        })
        flow.continue('snips-assistant:Stop', (_, flow) => {
            flow.end()
        })

        return i18n('sports.dialog.noTournament')
    } else {
        const now: number = Date.now()

        const mappings = await reader(teams, tournament)

        try {
            const speech = await soccerTournamentStanding(mappings)
            logger.info(speech)        

            flow.end()
            if (Date.now() - now < 4000) {
                return speech
            } else {
                tts.say(speech)
            }
        } catch (error) {
            logger.error(error)
            throw new Error('APIResponse')
        }
    }
}