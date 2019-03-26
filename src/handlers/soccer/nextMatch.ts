import { soccerTranslation } from '../../utils/sports/soccer'
import { i18nFactory } from '../../factories'
import {
    TeamSchedulePayload,
    TournamentSchedulePayload,
    getTournamentSchedule,
    getTeamSchedule
} from '../../api/soccer'
import { Mappings } from '../../utils/sports'

async function handleTournamentNextMatches(mappings: Mappings): Promise<string> {
    const i18n = i18nFactory.get()
    const now = new Date()

    let speech = ''
    let tournamentSchedule: TournamentSchedulePayload = await getTournamentSchedule(mappings.tournament.id)

    // filtering future events
    tournamentSchedule.sport_events = tournamentSchedule.sport_events.filter(
        e => new Date(e.scheduled) > now
    )

    if (tournamentSchedule.sport_events.length === 0) {
        speech += i18n('sports.soccer.dialog.tournamentOver', {
            tournament: mappings.tournament.name
        })
    } else {
        speech += soccerTranslation.tournamentScheduleToSpeech(tournamentSchedule)
    }

    return speech
}

async function handleTeamNextMatches(mappings: Mappings): Promise<string> {
    const i18n = i18nFactory.get()
    const now = new Date()

    let speech = ''
    let teamSchedule: TeamSchedulePayload = await getTeamSchedule(mappings.teams[0].id)

    // filtering future events
    teamSchedule.schedule = teamSchedule.schedule.filter(
        s => new Date(s.scheduled) > now
    )

    // is a tournament provided?
    if (mappings.tournament) {
        const scheduleInTournament = teamSchedule.schedule.filter(
            s => s.tournament.id === mappings.tournament.id
        )

        if (scheduleInTournament.length > 0) {
            teamSchedule.schedule = scheduleInTournament
        } else {
            speech += i18n('sports.soccer.dialog.teamWillNeverParticipateInTournament', {
                team: mappings.teams[0].name,
                tournament: mappings.tournament.name
            })
            speech += ' '
        }
    }

    if (teamSchedule.schedule.length === 0) {
        speech += i18n('sports.soccer.dialog.noScheduledGames', {
            team: mappings.teams[0].name
        })
    } else {
        speech += soccerTranslation.teamScheduleToSpeech(teamSchedule, mappings.teams[0].id)
    }

    return speech
}

async function handleTeamsNextMatches(mappings: Mappings): Promise<string> {
    const i18n = i18nFactory.get()
    const now = new Date()

    let speech: string = ''
    let teamSchedule: TeamSchedulePayload = await getTeamSchedule(mappings.teams[0].id)

    // filtering future events
    teamSchedule.schedule = teamSchedule.schedule.filter(
        s => new Date(s.scheduled) > now
    )

    // filtering common matches
    const commonSchedule = teamSchedule.schedule.filter(
        s => s.competitors.filter(c => c.id === mappings.teams[1].id).length === 1
    )

    if (commonSchedule.length === 0) {
        speech += i18n('sports.soccer.dialog.teamsWillNeverMeet', {
            team_1: mappings.teams[0].name,
            team_2: mappings.teams[1].name
        })
        speech += ' '
    } else {
        teamSchedule.schedule = commonSchedule

        // is a tournament provided?
        if (mappings.tournament) {
            // filtering scheduled games in this tournament
            const sheduleInTournament = teamSchedule.schedule.filter(
                s => s.tournament.id === mappings.tournament.id
            )

            if (sheduleInTournament.length > 0) {
                teamSchedule.schedule = sheduleInTournament
            } else {
                speech += i18n('sports.soccer.dialog.teamsWillNeverMeetInTournament', {
                    team_1: mappings.teams[0].name,
                    team_2: mappings.teams[1].name,
                    tournament: mappings.tournament.name
                })
                speech += ' '
            }
        }
    }

    if (teamSchedule.schedule.length === 0) {
        speech += i18n('sports.soccer.dialog.noScheduledGames', {
            team: mappings.teams[0].name
        })
    } else {
        speech += soccerTranslation.teamScheduleToSpeech(teamSchedule, mappings.teams[0].id)
    }

    return speech
}

export const soccerNextMatch = async function(mappings: Mappings): Promise<string> {
    let speech: string = ''

    switch (mappings.teams.length) {
        // one tournament
        case 0: {
            speech += await handleTournamentNextMatches(mappings)
            break
        }
        // one team + optional tournament
        case 1: {
            speech += await handleTeamNextMatches(mappings)
            break
        }
        // two teams + optional tournament
        case 2: {
            speech += await handleTeamsNextMatches(mappings)
            break
        }
    }

    return speech
}
