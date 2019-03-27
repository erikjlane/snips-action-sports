import { i18nFactory } from '../../../factories/i18nFactory'
import { beautify } from '../../beautify'
import {
    Result,
    TournamentStandingsPayload,
    TeamStanding,
    Group,
    TournamentResultsPayload,
    TournamentSchedulePayload,
    TeamSchedulePayload
} from '../../../api/soccer'
import { helpers } from './helpers'
import { time } from '../../time'
import { translation } from '../../translation'

function buildFinalPhasesTts(results: Result[], teamId: string): string {
    const i18n = i18nFactory.get()
    const result = results[results.length - 1]

    let tts: string = ''

    const team1 = result.sport_event.competitors.find(competitor => competitor.id === teamId)
    const team2 = result.sport_event.competitors.find(competitor => competitor.id !== teamId)

    const team1Score = result.sport_event_status[team1.qualifier + '_score']
    const team2Score = result.sport_event_status[team2.qualifier + '_score']

    if (result.sport_event_status.match_status === 'ended') {
        const key = (team1Score === team2Score)
            ? 'tiedFinalPhases'
            : ((team1Score < team2Score) ? 'lostFinalPhases' : 'wonFinalPhases')

        tts += i18n('sports.soccer.teamStanding.' + key, {
            team_2: team2.name,
            team_1_score: team1Score,
            team_2_score: team2Score,
            round: i18n('sports.soccer.finalPhases.roundOf16')
        })
    }

    return tts
}

export const soccerTranslation = {
    tournamentStandingsToSpeech(standings: TournamentStandingsPayload): string {
        let tts: string = ''

        // league
        if (helpers.isLeague(standings)) {
            const teamStandings: TeamStanding[] = standings.standings[0].groups[0].team_standings

            for (let i = 0; i < Math.min(teamStandings.length, 5); i++) {
                tts += translation.randomTranslation('sports.soccer.tournamentStandings.standings.' + (i + 1), {
                    team: teamStandings[i].team.name,
                    points: teamStandings[i].points
                })
                tts += ' '
            }
        }
        // cup
        else {
            const groups: Group[] = standings.standings[0].groups

            for (let group of groups) {
                const teamStandings: TeamStanding[] = group.team_standings

                tts += translation.randomTranslation('sports.soccer.tournamentStandings.standingInGroup', {
                    team: teamStandings[0].team.name,
                    group: group.name,
                    points: teamStandings[0].points
                })
                tts += ' '
            }
        }

        return tts
    },

    teamStandingToSpeech(standings: TournamentStandingsPayload, results: TournamentResultsPayload, teamId: string): string {
        const i18n = i18nFactory.get()

        let tts: string = ''

        const group = standings.standings[0].groups.find(
            g => g.team_standings.some(team => team.team.id === teamId)
        )
        const teamStandings = group.team_standings.find(team => team.team.id === teamId)

        // league
        if (helpers.isLeague(standings)) {
            tts += i18n('sports.soccer.tournamentStandings.rank', {
                team: teamStandings.team.name,
                tournament: standings.tournament.name,
                rank: teamStandings.rank
            })
        }
        // cup
        else {
            tts += i18n('sports.soccer.tournamentStandings.rankInGroup', {
                team: teamStandings.team.name,
                tournament: standings.tournament.name,
                rank: teamStandings.rank,
                group: group.name
            })

            tts += ' '
            tts += buildFinalPhasesTts(results.results.filter(
                r => r.sport_event.competitors.filter(c => c.id === teamId).length === 1
            ), teamId)
        }

        return tts
    },

    teamResultToSpeech(result: Result, firstTeamId: string, longTts = true): string {
        const i18n = i18nFactory.get()

        let tts: string = ''

        const team1 = result.sport_event.competitors.find(competitor => competitor.id === firstTeamId)
        const team2 = result.sport_event.competitors.find(competitor => competitor.id !== team1.id)

        const team1Score = result.sport_event_status[team1.qualifier + '_score']
        const team2Score = result.sport_event_status[team2.qualifier + '_score']

        const key = (team1Score === team2Score)
            ? 'teamTied'
            : ((team1Score < team2Score) ? 'teamLost' : 'teamWon')

        tts += i18n((longTts ? 'sports.soccer.matchResults.' : 'sports.soccer.tournamentResults.') + key, {
            tournament: result.sport_event.tournament.name,
            team_1: team1.name,
            team_2: team2.name,
            date: beautify.date(new Date(result.sport_event.scheduled)),
            team_1_score: team1Score,
            team_2_score: team2Score
        })

        return tts
    },

    tournamentResultsToSpeech(tournamentResults: TournamentResultsPayload): string {
        const i18n = i18nFactory.get()

        let results = tournamentResults.results
        let tts: string = ''

        // league
        if (helpers.isLeague(tournamentResults)) {
            const round = results[results.length - 1].sport_event.tournament_round.number

            tts += i18n('sports.soccer.tournamentResults.introductionRound', {
                tournament: results[0].sport_event.tournament.name,
                day: round
            })
            tts += ' '

            results = results.filter(result => result.sport_event.tournament_round.number === round)
        }
        // cup
        else {
            const day = new Date(results[results.length - 1].sport_event.scheduled)

            tts += i18n('sports.soccer.tournamentResults.introduction', {
                tournament: results[0].sport_event.tournament.name
            })
            tts += ' '

            // printing games played the same day
            results = results.filter(
                r => time.areSameDays(day, new Date(r.sport_event.scheduled))
            )
        }

        for (let result of results) {
            tts += soccerTranslation.teamResultToSpeech(result, result.sport_event.competitors[0].id, false)
            tts += ' '
        }

        return tts
    },

    tournamentScheduleToSpeech(schedule: TournamentSchedulePayload): string {
        const i18n = i18nFactory.get()

        let tts: string = ''

        const nextDate = new Date(schedule.sport_events[0].scheduled)
        const events = schedule.sport_events.filter(
            e => time.areSameDays(new Date(e.scheduled), nextDate)
        )

        tts += i18n('sports.soccer.tournamentSchedule.introduction', {
            tournament: schedule.tournament.name,
            date: beautify.date(new Date(events[0].scheduled))
        })
        tts += ' '

        for (let event of events) {
            tts += translation.randomTranslation('sports.soccer.tournamentSchedule.match', {
                team_1: event.competitors[0].name,
                team_2: event.competitors[1].name,
                time: beautify.time(new Date(event.scheduled))
            })
            tts += ' '
        }

        return tts
    },

    teamScheduleToSpeech(schedule: TeamSchedulePayload, firstTeamId: string): string {
        const i18n = i18nFactory.get()

        let tts: string = ''
            
        const scheduledEvent = schedule.schedule[0]
        const scheduled = new Date(scheduledEvent.scheduled)

        const team1 = scheduledEvent.competitors.find(competitor => competitor.id === firstTeamId)
        const team2 = scheduledEvent.competitors.find(competitor => competitor.id !== team1.id)

        tts += i18n('sports.soccer.teamSchedule.nextMatch', {
            team_1: team1.name,
            team_2: team2.name,
            tournament: scheduledEvent.tournament.name,
            date: beautify.date(scheduled),
            time: beautify.time(scheduled)
        })

        return tts
    }
}
