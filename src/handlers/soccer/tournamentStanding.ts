import { translation } from '../../utils'
import { helpers } from '../../utils/sports'
import {
    getTournamentStandings,
    getTournamentResults
} from '../../api'
import { Mappings } from '../../utils/sports/reader'
import { i18nFactory } from '../../factories'

export const soccerTournamentStanding = async function(mappings: Mappings): Promise<string> {
    const i18n = i18nFactory.get()

    let speech: string = ''

    const tournamentStandings = await getTournamentStandings(mappings.tournament.id)

    //TODO: fix QPS limit
    await new Promise(resolve => setTimeout(resolve, 1000))

    const tournamentResults = await getTournamentResults(mappings.tournament.id)

    // regular season
    if (helpers.isRegularSeason(tournamentResults)) {
        // tournament and team
        if (mappings.teams.length > 0) {
            const inTournamentResults = tournamentResults.results.filter(
                r => r.sport_event.competitors.filter(c => c.id === mappings.teams[0].id).length === 1
            )

            if (inTournamentResults.length > 0) {
                return translation.teamStandingToSpeech(tournamentStandings, tournamentResults, mappings.teams[0].id)
            } else {
                speech += i18n('sports.dialog.teamDoesntParticipateInTournament', {
                    team: mappings.teams[0].name,
                    tournament: mappings.tournament.name
                })
                speech += ' '
            }
        }

        speech += translation.tournamentStandingsToSpeech(tournamentStandings)
    }

    // group phases
    else {
        // tournament and team
        if (mappings.teams.length > 0) {
            const inTournamentResults = tournamentResults.results.filter(
                r => r.sport_event.competitors.filter(c => c.id === mappings.teams[0].id).length === 1
            )

            if (inTournamentResults.length > 0) {
                return translation.teamStandingToSpeech(tournamentStandings, tournamentResults, mappings.teams[0].id)
            } else {
                speech += i18n('sports.dialog.teamDoesntParticipateInTournament', {
                    team: mappings.teams[0].name,
                    tournament: mappings.tournament.name
                })
                speech += ' '
            }
        }

        speech += translation.tournamentStandingsToSpeech(tournamentStandings)
    }

    return speech
}