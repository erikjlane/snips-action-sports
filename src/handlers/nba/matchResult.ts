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

async function handleTeamMatchResults(mappings: Mappings): Promise<string> {
    let speech: string = ''
    let schedule: SchedulePayload = await getSchedule()

    // keeping closed games only
    schedule.games = schedule.games.filter(
        g => g.status === 'closed'
    )

    // filtering team games
    schedule.games = schedule.games.filter(
        g => g.home.sr_id === mappings.teams[0].id || g.away.sr_id === mappings.teams[0].id
    )

    speech += nbaTranslation.teamResultToSpeech(schedule.games[schedule.games.length - 1], mappings.teams[0].id)

    return speech
}

async function handleTeamsMatchResults(mappings: Mappings): Promise<string> {
    const i18n = i18nFactory.get()

    let speech: string = ''
    let schedule: SchedulePayload = await getSchedule()

    // keeping closed games only
    schedule.games = schedule.games.filter(
        g => g.status === 'closed'
    )

    // filtering team games
    schedule.games = schedule.games.filter(
        g => g.home.sr_id === mappings.teams[0].id || g.away.sr_id === mappings.teams[0].id
    )

    // filtering common games
    const commonSchedule = schedule.games.filter(
        g => g.home.sr_id === mappings.teams[1].id || g.away.sr_id === mappings.teams[1].id
    )

    if (commonSchedule.length === 0) {
        speech += i18n('sports.nba.dialog.teamsNeverMet')
        speech += ' '
    } else {
        schedule.games = commonSchedule
    }

    speech += nbaTranslation.teamResultToSpeech(schedule.games[schedule.games.length - 1], mappings.teams[0].id)

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
            speech += await handleTeamMatchResults(mappings)
            break
        }
        // two teams + optional tournament
        case 2: {
            speech += await handleTeamsMatchResults(mappings)
            break
        }
    }

    return speech
}
