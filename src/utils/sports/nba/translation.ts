import { i18nFactory } from '../../../factories/i18nFactory'
import { beautify } from '../../beautify'
import { RankingsPayload, Team, SchedulePayload } from '../../../api/nba'
import { time } from '../../time'
import { translation } from '../../translation'

export const nbaTranslation = {
    tournamentRankingsToSpeech(rankings: RankingsPayload): string {
        const i18n = i18nFactory.get()

        let tts: string = ''

        for (let conference of rankings.conferences) {
            let teams: Team[] = []

            for (let division of conference.divisions) {
                teams = teams.concat(division.teams)
            }

            teams.sort((t1, t2) => t1.rank.conference - t2.rank.conference)

            tts += i18n('sports.nba.tournamentStandings.standingsInConferences', {
                conference: conference.name,
                team_1: teams[0].name,
                team_2: teams[1].name,
                team_3: teams[2].name
            })
            tts += ' '
        }

        return tts
    },

    teamRankingToSpeech(rankings: RankingsPayload, teamId: string): string {
        const i18n = i18nFactory.get()

        let tts: string = ''

        for (let conference of rankings.conferences) {
            for (let division of conference.divisions) {
                let team = division.teams.find(t => t.sr_id === teamId)

                if (team) {
                    return i18n('sports.nba.tournamentStandings.rank', {
                        team: team.name,
                        rank: team.rank.conference,
                        conference: conference.name
                    })
                }
            }
        } 

        return tts
    },

    tournamentScheduleToSpeech(schedule: SchedulePayload): string {
        const i18n = i18nFactory.get()

        let tts: string = ''

        const nextDate = new Date(schedule.games[0].scheduled)
        const games = schedule.games.filter(
            g => time.areSameDays(new Date(g.scheduled), nextDate)
        )

        tts += i18n('sports.nba.tournamentSchedule.introduction', {
            date: beautify.date(new Date(games[0].scheduled))
        })
        tts += ' '

        for (let game of games) {
            tts += translation.randomTranslation('sports.nba.tournamentSchedule.game', {
                team_1: game.home.name,
                team_2: game.away.name,
                time: beautify.time(new Date(game.scheduled))
            })
            tts += ' '
        }

        return tts
    },

    teamScheduleToSpeech(schedule: SchedulePayload, firstTeamId: string): string {
        const i18n = i18nFactory.get()

        let tts: string = ''
            
        const scheduledGame = schedule.games[0]
        const scheduled = new Date(scheduledGame.scheduled)

        tts += i18n('sports.nba.teamSchedule.nextMatch', {
            team_1: (scheduledGame.home.sr_id === firstTeamId) ? scheduledGame.home.name : scheduledGame.away.name,
            team_2: (scheduledGame.home.sr_id === firstTeamId) ? scheduledGame.away.name : scheduledGame.home.name,
            date: beautify.date(scheduled),
            time: beautify.time(scheduled)
        })

        return tts
    }
}
