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

    if (mappings.teams.length > 0) {
        return nbaTranslation.teamRankingToSpeech(rankings, mappings.teams[0].id)
    }

    speech += nbaTranslation.tournamentRankingsToSpeech(rankings)

    return speech
}
