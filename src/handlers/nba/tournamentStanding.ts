import { nbaTranslation } from '../../utils/sports/nba'
import {
    getRankings
} from '../../api/nba'
import { Mappings } from '../../utils/sports/reader'
import { i18nFactory } from '../../factories'

export const nbaTournamentStanding = async function(mappings: Mappings): Promise<string> {
    const i18n = i18nFactory.get()

    let speech: string = ''

    const rankings = await getRankings()

    // tournament and team
    if (mappings.teams.length > 0) {
        const inRankingsTeam = rankings.conferences.filter(
            c => c.divisions.filter(d => d.teams.find(t => t.sr_id === mappings.teams[0].id)).length !== 0
        )

        if (inRankingsTeam.length === 0) {
            speech += i18n('sports.nba.dialog.teamDoesntParticipateInTournament', {
                team: mappings.teams[0].name
            })
            speech += ' '
        } else {
            return nbaTranslation.teamRankingToSpeech(rankings, mappings.teams[0].id)
        }
    }

    speech += nbaTranslation.tournamentRankingsToSpeech(rankings)

    return speech
}
