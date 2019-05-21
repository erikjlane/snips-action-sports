import { IntentMessage, slotType, NluSlot } from 'hermes-javascript/types'
import { message, logger } from 'snips-toolkit'
import { SLOT_CONFIDENCE_THRESHOLD } from '../constants'

export type KnownSlots = {
    depth: number,
    teams?: string[],
    tournament?: string,
    from?: Date,
    to?: Date
}

export default async function (msg: IntentMessage, knownSlots: KnownSlots) {
    let teams: string[], tournament: string

    if (!('teams' in knownSlots)) {
        const teamsSlot: NluSlot<slotType.custom>[] = message.getSlotsByName(msg, 'team', {
            threshold: SLOT_CONFIDENCE_THRESHOLD
        })

        if (teamsSlot) {
            teams = teamsSlot.map(x => x.value.value)
        }
    } else {
        teams = knownSlots.teams
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

    logger.info('\tteams: ', teams)
    logger.info('\ttournament: ', tournament)

    return { teams, tournament }
}
