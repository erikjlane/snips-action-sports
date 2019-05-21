import { soccerTranslation, helpers } from '../../utils/sports/soccer'
import { i18n } from 'snips-toolkit'
import {
    TeamSchedulePayload,
    TournamentSchedulePayload,
    getTournamentSchedule,
    getTeamSchedule
} from '../../api/soccer'
import { Mappings } from '../../utils/sports'

async function handleTournamentNextMatches(mappings: Mappings): Promise<string> {
    let speech = ''
    let schedule: TournamentSchedulePayload = await getTournamentSchedule(mappings.tournament.id)

    // filtering future events
    schedule = helpers.getTournamentFutureEvents(schedule)

    if (schedule.sport_events.length === 0) {
        speech += i18n.translate('sports.soccer.dialog.tournamentOver', {
            tournament: mappings.tournament.name
        })
    } else {
        speech += soccerTranslation.tournamentScheduleToSpeech(schedule)
    }

    return speech
}

async function handleTeamNextMatches(mappings: Mappings): Promise<string> {
    let speech = ''
    let schedule: TeamSchedulePayload = await getTeamSchedule(mappings.teams[0].id)

    // filtering future events
    schedule = helpers.getTeamFutureEvents(schedule)

    // is a tournament provided?
    if (mappings.tournament) {
        const scheduleInTournament = schedule.schedule.filter(
            s => s.tournament.id === mappings.tournament.id
        )

        if (scheduleInTournament.length > 0) {
            schedule.schedule = scheduleInTournament
        } else {
            speech += i18n.translate('sports.soccer.dialog.teamWillNeverParticipateInTournament', {
                team: mappings.teams[0].name,
                tournament: mappings.tournament.name
            })
            speech += ' '
        }
    }

    if (schedule.schedule.length === 0) {
        speech += i18n.translate('sports.soccer.dialog.noScheduledGames', {
            team: mappings.teams[0].name
        })
    } else {
        speech += soccerTranslation.teamScheduleToSpeech(schedule, mappings.teams[0].id)
    }

    return speech
}

async function handleTeamsNextMatches(mappings: Mappings): Promise<string> {
    if (mappings.teams[0].id === mappings.teams[1].id) {
        return handleTeamNextMatches(mappings)
    }

    let speech: string = ''
    let schedule: TeamSchedulePayload = await getTeamSchedule(mappings.teams[0].id)

    // filtering future events
    schedule = helpers.getTeamFutureEvents(schedule)

    // filtering common matches
    const commonSchedule = schedule.schedule.filter(
        s => s.competitors.filter(c => c.id === mappings.teams[1].id).length === 1
    )

    if (commonSchedule.length === 0) {
        speech += i18n.translate('sports.soccer.dialog.teamsWillNeverMeet', {
            team_1: mappings.teams[0].name,
            team_2: mappings.teams[1].name
        })
        speech += ' '
    } else {
        schedule.schedule = commonSchedule

        // is a tournament provided?
        if (mappings.tournament) {
            // filtering scheduled games in this tournament
            const sheduleInTournament = schedule.schedule.filter(
                s => s.tournament.id === mappings.tournament.id
            )

            if (sheduleInTournament.length > 0) {
                schedule.schedule = sheduleInTournament
            } else {
                speech += i18n.translate('sports.soccer.dialog.teamsWillNeverMeetInTournament', {
                    team_1: mappings.teams[0].name,
                    team_2: mappings.teams[1].name,
                    tournament: mappings.tournament.name
                })
                speech += ' '
            }
        }
    }

    if (schedule.schedule.length === 0) {
        speech += i18n.translate('sports.soccer.dialog.noScheduledGames', {
            team: mappings.teams[0].name
        })
    } else {
        speech += soccerTranslation.teamScheduleToSpeech(schedule, mappings.teams[0].id)
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
