import { nbaTranslation } from '../../utils/sports/nba'
import {
    getSchedule
} from '../../api/nba'
import { Mappings } from '../../utils/sports/reader'
import { i18nFactory } from '../../factories'

export const nbaNextMatch = async function(mappings: Mappings): Promise<string> {
    const i18n = i18nFactory.get()

    let speech: string = ''

    const rankings = await getSchedule()

    console.log(rankings)
    //speech += nbaTranslation.tournamentRankingsToSpeech(rankings)

    return speech
}
