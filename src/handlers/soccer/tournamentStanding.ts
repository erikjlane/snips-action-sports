import { translation } from '../../utils'
import { helpers } from '../../utils/sports'
import {
    getTournamentStandings,
    TournamentStandingsPayload,
    getTournamentResults,
    TournamentResultsPayload
} from '../../api'
import { Mappings } from '../../utils/sports/reader'

export const soccerTournamentStanding = async function(mappings: Mappings): Promise<string> {
    let speech: string = ''

    let tournamentResults: TournamentResultsPayload
    let tournamentStandings: TournamentStandingsPayload

    tournamentStandings = await getTournamentStandings(mappings.tournament.id)

    //TODO: fix QPS limit
    await new Promise(resolve => setTimeout(resolve, 1000))

    tournamentResults = await getTournamentResults(mappings.tournament.id)

    // regular season
    if (helpers.isRegularSeason(tournamentResults)) {
        // tournament only
        if (mappings.teams.length === 0) {
            speech += translation.tournamentStandingsToSpeech(tournamentStandings)
        }
        // tournament and team
        else if (mappings.teams.length > 0) {
            speech += translation.teamStandingToSpeech(tournamentStandings, tournamentResults, mappings.teams[0].id)
        }
    }
    // group phases
    else {
        // tournament only
        if (mappings.teams.length === 0) {
            speech += translation.tournamentStandingsToSpeech(tournamentStandings)
        }
        // tournament and team
        else if (mappings.teams.length > 0) {
            speech += translation.teamStandingToSpeech(tournamentStandings, tournamentResults, mappings.teams[0].id)
        }
    }

    return speech
}