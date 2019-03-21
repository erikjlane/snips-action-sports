import { translation } from '../../utils'
import { i18nFactory } from '../../factories'
import {
    TeamSchedulePayload,
    TournamentSchedulePayload,
    getTournamentSchedule,
    getTeamSchedule
} from '../../api'
import { Mappings } from '../../utils/sports'

export const soccerNextMatch = async function(mappings: Mappings): Promise<string> {
    const i18n = i18nFactory.get()

    let speech: string = ''

    let teamSchedule: TeamSchedulePayload
    let tournamentSchedule: TournamentSchedulePayload

    // tournament only
    if (mappings.teams.length === 0) {
        tournamentSchedule = await getTournamentSchedule(mappings.tournament.id)
        speech += translation.tournamentScheduleToSpeech(tournamentSchedule)
    }
    
    // one team + optional tournament
    else if (mappings.teams.length === 1) {
        teamSchedule = await getTeamSchedule(mappings.teams[0].id)
        teamSchedule.schedule = teamSchedule.schedule.filter(
            s => new Date(s.scheduled) > new Date()
        )

        if (mappings.tournament) {
            const inTournamentSchedules = teamSchedule.schedule.filter(
                s => s.tournament.id === mappings.tournament.id
            )

            if (inTournamentSchedules.length > 0) {
                teamSchedule.schedule = inTournamentSchedules
            } else {
                speech += i18n('sports.dialog.teamWillNeverParticipateInTournament', {
                    tournament: mappings.tournament.name
                })
                speech += ' '
            }
        }

        speech += translation.teamScheduleToSpeech(teamSchedule, mappings.teams[0].id)
    } 

    // two teams + optional tournament
    else {
        teamSchedule = await getTeamSchedule(mappings.teams[0].id)
        teamSchedule.schedule = teamSchedule.schedule.filter(
            s => new Date(s.scheduled) > new Date()
        )

        const nextSchedules = teamSchedule.schedule.filter(
            s => s.competitors.filter(c => c.id === mappings.teams[1].id).length === 1
        )

        if (nextSchedules.length === 0) {
            speech = i18n('sports.dialog.teamsWillNeverMeet')
        } else {
            teamSchedule.schedule = nextSchedules

            if (mappings.tournament) {
                const inTournamentSchedules = teamSchedule.schedule.filter(
                    s => s.tournament.id === mappings.tournament.id
                )

                if (inTournamentSchedules.length > 0) {
                    teamSchedule.schedule = inTournamentSchedules
                } else {
                    speech += i18n('sports.dialog.teamsWillNeverMeetInTournament', {
                        tournament: mappings.tournament.name
                    })
                    speech += ' '
                }
            }

            speech += translation.teamScheduleToSpeech(teamSchedule, mappings.teams[0].id)
        }
    }

    return speech
}