import { soccerTranslation } from '../../utils/sports/soccer'
import { helpers } from '../../utils/sports'
import {
    getTournamentStandings,
    getTournamentResults,
    TournamentStandingsPayload,
    TournamentResultsPayload
} from '../../api/soccer'
import { Mappings } from '../../utils/sports/reader'
import { i18nFactory } from '../../factories'

async function handleRegularSeasonStandings(mappings: Mappings, tournamentStandings: TournamentStandingsPayload, tournamentResults: TournamentResultsPayload): Promise<string> {
    const i18n = i18nFactory.get()

    let speech: string = ''

    if (mappings.teams.length > 0) {
        const inTournamentResults = tournamentResults.results.filter(
            r => r.sport_event.competitors.filter(c => c.id === mappings.teams[0].id).length === 1
        )

        if (inTournamentResults.length === 0) {
            speech += i18n('sports.soccer.dialog.teamDoesntParticipateInTournament', {
                team: mappings.teams[0].name,
                tournament: mappings.tournament.name
            })
            speech += ' '
        } else {
            return soccerTranslation.teamStandingToSpeech(tournamentStandings, tournamentResults, mappings.teams[0].id)
        }
    }

    speech += soccerTranslation.tournamentStandingsToSpeech(tournamentStandings)

    return speech
}

async function handleFinalPhasesStandings(mappings: Mappings, tournamentStandings: TournamentStandingsPayload, tournamentResults: TournamentResultsPayload): Promise<string> {
    const i18n = i18nFactory.get()

    let speech: string = ''

    if (mappings.teams.length > 0) {
        const inTournamentResults = tournamentResults.results.filter(
            r => r.sport_event.competitors.filter(c => c.id === mappings.teams[0].id).length === 1
        )

        if (inTournamentResults.length === 0) {
            speech += i18n('sports.soccer.dialog.teamDoesntParticipateInTournament', {
                team: mappings.teams[0].name,
                tournament: mappings.tournament.name
            })
            speech += ' '
        } else {
            return soccerTranslation.teamStandingToSpeech(tournamentStandings, tournamentResults, mappings.teams[0].id)
        }
    }

    speech += soccerTranslation.tournamentStandingsToSpeech(tournamentStandings)

    return speech
}

export const soccerTournamentStanding = async function(mappings: Mappings): Promise<string> {
    let speech: string = ''

    const tournamentStandings = await getTournamentStandings(mappings.tournament.id)
    //TODO: fix QPS limit
    await new Promise(resolve => setTimeout(resolve, 1000))
    const tournamentResults = await getTournamentResults(mappings.tournament.id)

    if (helpers.isRegularSeason(tournamentResults)) {
        speech += await handleRegularSeasonStandings(mappings, tournamentStandings, tournamentResults)
    } else {
        speech += await handleFinalPhasesStandings(mappings, tournamentStandings, tournamentResults)
    }

    return speech
}
