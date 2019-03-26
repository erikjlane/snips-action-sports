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

async function handleTeamNextMatch(mappings: Mappings): Promise<string> {
    const i18n = i18nFactory.get()
    const now = new Date()

    let speech: string = ''

    const schedule: SchedulePayload = await getSchedule()

    // filtering future events
    schedule.games = schedule.games.filter(
        g => new Date(g.scheduled) > now
    )

    // filtering team games
    schedule.games = schedule.games.filter(
        g => g.home.sr_id === mappings.teams[0].id || g.away.sr_id === mappings.teams[0].id
    )

    if (schedule.games.length === 0) {
        speech += i18n('sports.nba.dialog.noScheduledGames', {
            team: mappings.teams[0].name
        })
    } else {
        speech += nbaTranslation.teamScheduleToSpeech(schedule, mappings.teams[0].id)
    }

    return speech
}

async function handleTeamsNextMatch(mappings: Mappings): Promise<string> {
    const i18n = i18nFactory.get()
    const now = new Date()

    let speech: string = ''

    const schedule: SchedulePayload = await getSchedule()

    // filtering future events
    schedule.games = schedule.games.filter(
        g => new Date(g.scheduled) > now
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
        speech += i18n('sports.nba.dialog.teamsWillNeverMeet', {
            team_1: mappings.teams[0].name,
            team_2: mappings.teams[1].name
        })
        speech += ' '
    } else {
        schedule.games = commonSchedule
    }

    if (schedule.games.length === 0) {
        speech += i18n('sports.nba.dialog.noScheduledGames', {
            team: mappings.teams[0].name
        })
    } else {
        speech += nbaTranslation.teamScheduleToSpeech(schedule, mappings.teams[0].id)
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
            speech += await handleTeamNextMatch(mappings)
            break
        }
        // two teams + optional tournament
        case 2: {
            speech += await handleTeamsNextMatch(mappings)
            break
        }
    }

    return speech
}
