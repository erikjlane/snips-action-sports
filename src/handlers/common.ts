import { IntentMessage, slotType, NluSlot } from 'hermes-javascript'
import {
    message,
    logger
} from '../utils'
import {
    SLOT_CONFIDENCE_THRESHOLD,
    INTENT_PROBABILITY_THRESHOLD,
    ASR_UTTERANCE_CONFIDENCE_THRESHOLD
} from '../constants'

export type KnownSlots = {
    depth: number,
    team?: string,
    tournament?: string,
    league?: string
}

export default async function (msg: IntentMessage, knownSlots: KnownSlots) {
    if (msg.intent) {
        if (msg.intent.confidenceScore < INTENT_PROBABILITY_THRESHOLD) {
            throw new Error('intentNotRecognized')
        }
        if (message.getAsrConfidence(msg) < ASR_UTTERANCE_CONFIDENCE_THRESHOLD) {
            throw new Error('intentNotRecognized')
        }
    }

    let team: string, tournament: string, league: string

    if (!('team' in knownSlots)) {
        const teamSlot: NluSlot<slotType.custom> = message.getSlotsByName(msg, 'team', {
            onlyMostConfident: true, 
            threshold: SLOT_CONFIDENCE_THRESHOLD
        })

        if (teamSlot) {
            team = teamSlot.value.value
        }
    } else {
        team = knownSlots.team
    }

    if (!('tournament' in knownSlots)) {
        const tournamentSlot: NluSlot<slotType.custom> = message.getSlotsByName(msg, 'tournament', {
            onlyMostConfident: true,
            threshold: SLOT_CONFIDENCE_THRESHOLD
        })

        if (tournamentSlot) {
            tournament = tournamentSlot.value.value
        }
    } else {
        tournament = knownSlots.tournament
    }

    if (!('league' in knownSlots)) {
        const leagueSlot: NluSlot<slotType.custom> = message.getSlotsByName(msg, 'league', {
            onlyMostConfident: true,
            threshold: SLOT_CONFIDENCE_THRESHOLD
        })

        if (leagueSlot) {
            league = leagueSlot.value.value
        }
    } else {
        league = knownSlots.league
    }

    logger.info('\tteam: ', team)
    logger.info('\ttournament: ', tournament)
    logger.info('\tleague: ', league)

    return { team, tournament, league }
}