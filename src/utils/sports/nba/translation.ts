import { i18nFactory } from '../../../factories/i18nFactory'
import { RankingsPayload, Team } from '../../../api/nba'

export const nbaTranslation = {
    tournamentRankingsToSpeech(rankings: RankingsPayload): string {
        const i18n = i18nFactory.get()

        let speech: string = ''

        for (let conference of rankings.conferences) {
            let teams: Team[] = []

            for (let division of conference.divisions) {
                teams = teams.concat(division.teams)
            }

            teams.sort((t1, t2) => t1.rank.conference - t2.rank.conference)

            speech += i18n('sports.nba.tournamentStandings.standingsInConferences', {
                conference: conference.name,
                team_1: teams[0].name,
                team_2: teams[1].name,
                team_3: teams[2].name
            })
            speech += ' '
        }

        return speech
    },

    teamRankingToSpeech(rankings: RankingsPayload, teamId: string): string {
        const i18n = i18nFactory.get()

        let speech: string = ''

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

        return speech
    }
}
