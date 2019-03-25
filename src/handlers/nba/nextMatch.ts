import { nbaTranslation } from '../../utils/sports/nba'
import {
    getSchedule, SchedulePayload
} from '../../api/nba'
import { Mappings } from '../../utils/sports/reader'
import { i18nFactory } from '../../factories'

async function handleTournamentNextMatches(): Promise<string> {
    const i18n = i18nFactory.get()
    const now = new Date()

    let speech: string = ''

    const schedule: SchedulePayload = await getSchedule()

    // filtering future events
    schedule.games = schedule.games.filter(
        g => new Date(g.scheduled) > now
    )

    if (schedule.games.length === 0) {
        speech += i18n('sports.nba.dialog.tournamentOver')
    } else {
        speech += nbaTranslation.tournamentScheduleToSpeech(schedule)
    }

    return speech
}

export const nbaNextMatch = async function(mappings: Mappings): Promise<string> {
    let speech: string = ''

    switch (mappings.teams.length) {
        // one tournament
        case 0: {
            speech += await handleTournamentNextMatches()
            break
        }
        // one team + optional tournament
        case 1: {
            speech += ''
            break
        }
        // two teams + optional tournament
        case 2: {
            speech += ''
            break
        }
    }

    return speech
}
