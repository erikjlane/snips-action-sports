import { nbaTranslation } from '../../utils/sports/nba'
import { i18nFactory } from '../../factories'
import {
    getSchedule,
    SchedulePayload
} from '../../api/nba'
import { Mappings } from '../../utils/sports'

async function handleTournamentMatchResults(): Promise<string> {
    let speech: string = ''
    let schedule: SchedulePayload = await getSchedule()

    // keeping closed games only
    schedule.games = schedule.games.filter(
        g => g.status === 'closed'
    )

    speech += nbaTranslation.tournamentResultsToSpeech(schedule)

    return speech
}

export const nbaMatchResult = async function(mappings: Mappings): Promise<string> {
    let speech: string = ''

    switch (mappings.teams.length) {
        // one tournament
        case 0: {
            speech += await handleTournamentMatchResults()
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
