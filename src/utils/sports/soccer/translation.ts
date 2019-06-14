import { i18nFactory } from '../../../factories/i18nFactory'
import { beautify } from '../../beautify'
import {
    Result,
    TournamentStandingsPayload,
    TeamStanding,
    Group,
    TournamentResultsPayload,
    TournamentSchedulePayload,
    TeamSchedulePayload,
    TournamentRound
} from '../../../api/soccer'
import { helpers } from './helpers'
import { time } from '../../time'
import { translation } from '../../translation'

export const soccerTranslation = {
    leagueStandingsToSpeech(standings: TournamentStandingsPayload): string {
        let tts: string = ''

        const teamStandings: TeamStanding[] = standings.standings[0].groups[0].team_standings

        for (let i = 0; i < Math.min(teamStandings.length, 5); i++) {
            tts += translation.randomTranslation('sports.soccer.tournamentStandings.standings.' + (i + 1), {
                team: teamStandings[i].team.name,
                points: teamStandings[i].points
            })
            tts += ' '
        }

        return tts
    },

    leagueTeamStandingToSpeech(standings: TournamentStandingsPayload, teamId: string): string {
        const i18n = i18nFactory.get()

        let tts: string = ''

        const group = standings.standings[0].groups.find(
            g => g.team_standings.some(team => team.team.id === teamId)
        )
        const teamStandings = group.team_standings.find(team => team.team.id === teamId)

        tts += i18n('sports.soccer.tournamentStandings.rank', {
            team: teamStandings.team.name,
            tournament: standings.tournament.name,
            rank: teamStandings.rank
        })

        return tts
    },

    groupsStandingsToSpeech(standings: TournamentStandingsPayload): string {
        let tts: string = ''

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

        return tts
    },

    groupsTeamStandingToSpeech(standings: TournamentStandingsPayload, teamId: string): string {
        const i18n = i18nFactory.get()

        let tts: string = ''

        const group = standings.standings[0].groups.find(
            g => g.team_standings.some(team => team.team.id === teamId)
        )
        const teamStandings = group.team_standings.find(team => team.team.id === teamId)

        tts += i18n('sports.soccer.tournamentStandings.rankInGroup', {
            team: teamStandings.team.name,
            tournament: standings.tournament.name,
            rank: teamStandings.rank,
            group: group.name
        })

        return tts
    },

    cupStandingsToSpeech(results: TournamentResultsPayload, round: TournamentRound): string {
        const i18n = i18nFactory.get()

        let tts: string = ''

        tts += i18n('sports.soccer.tournamentStandings.finalPhase.currentStage', {
            tournament: results.tournament.name,
            round: round.cup_round_match_number,
            stage: i18n('sports.soccer.finalPhase.' + round.name)
        })
        tts += ' '

        for (let result of results.results) {
            tts += soccerTranslation.teamResultToSpeech(result, result.sport_event.competitors[0].id, false)
            tts += ' '
        }

        return tts
    },

    cupTeamStandingToSpeech(result: Result, round: TournamentRound, firstTeamId: string): string {
        const i18n = i18nFactory.get()

        let tts: string = ''

        tts += i18n('sports.soccer.tournamentStandings.finalPhase.currentStage', {
            tournament: result.sport_event.tournament.name,
            round: round.cup_round_match_number,
            stage: i18n('sports.soccer.finalPhase.' + round.name)
        })
        tts += ' '

        if (result) {
            tts += soccerTranslation.teamResultToSpeech(result, firstTeamId, false)
        } else {
            tts += i18n('sports.soccer.tournamentStandings.finalPhase.didntPlayYet')
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
                tournament: tournamentResults.tournament.name,
                day: round
            })
            tts += ' '

            results = results.filter(result => result.sport_event.tournament_round.number === round)
        }
        // cup
        else {
            const day = new Date(results[results.length - 1].sport_event.scheduled)

            tts += i18n('sports.soccer.tournamentResults.introduction', {
                tournament: tournamentResults.tournament.name
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
