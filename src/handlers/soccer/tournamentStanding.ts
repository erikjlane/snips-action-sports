import { soccerTranslation } from '../../utils/sports/soccer'
import { helpers } from '../../utils/sports/soccer'
import {
    getTournamentStandings,
    getTournamentResults,
    TournamentStandingsPayload,
    TournamentResultsPayload
} from '../../api/soccer'
import { Mappings } from '../../utils/sports/reader'
import { i18nFactory } from '../../factories'

async function handleLeagueStandings(mappings: Mappings, standings: TournamentStandingsPayload, results: TournamentResultsPayload): Promise<string> {
    const i18n = i18nFactory.get()

    let speech: string = ''

    if (mappings.teams.length > 0) {
        if (helpers.getMatchesFromTeam(results, mappings.teams[0].id).results.length === 0) {
            speech += i18n('sports.soccer.dialog.teamDoesntParticipateInTournament', {
                team: mappings.teams[0].name,
                tournament: mappings.tournament.name
            })
            speech += ' '
        } else {
            return soccerTranslation.teamStandingToSpeech(standings, results, mappings.teams[0].id)
        }
    }

    speech += soccerTranslation.tournamentStandingsToSpeech(standings)

    return speech
}

async function handleCupStandings(mappings: Mappings, standings: TournamentStandingsPayload, results: TournamentResultsPayload): Promise<string> {
    const i18n = i18nFactory.get()

    let speech: string = ''

    if (mappings.teams.length > 0) {
        if (helpers.getMatchesFromTeam(results, mappings.teams[0].id).results.length === 0) {
            speech += i18n('sports.soccer.dialog.teamDoesntParticipateInTournament', {
                team: mappings.teams[0].name,
                tournament: mappings.tournament.name
            })
            speech += ' '
        } else {
            if (helpers.finalPhaseStarted(results)) {
                const round = helpers.getHighestFinalPhase(results)
                const finalPhaseResults = helpers.getMatchesFromRound(results, round)
                const teamResults = helpers.getMatchesFromTeam(finalPhaseResults, mappings.teams[0].id)

                return soccerTranslation.teamStandingFinalPhaseToSpeech(teamResults.results[teamResults.results.length - 1], round, mappings.teams[0].id)
            } else {
                return soccerTranslation.teamStandingToSpeech(standings, results, mappings.teams[0].id)
            }
        }
    }

    if (helpers.finalPhaseStarted(results)) {
        const round = helpers.getHighestFinalPhase(results)
        const finalPhaseResults = helpers.getMatchesFromRound(results, round)

        speech += soccerTranslation.tournamentStandingsFinalPhaseToSpeech(finalPhaseResults, round)
    } else {
        speech += soccerTranslation.tournamentStandingsToSpeech(standings)
    }

    return speech
}

export const soccerTournamentStanding = async function(mappings: Mappings): Promise<string> {
    let speech: string = ''

    const tournamentStandings = await getTournamentStandings(mappings.tournament.id)
    //TODO: fix QPS limit
    await new Promise(resolve => setTimeout(resolve, 1000))
    const tournamentResults = await getTournamentResults(mappings.tournament.id)

    if (helpers.isLeague(tournamentResults)) {
        speech += await handleLeagueStandings(mappings, tournamentStandings, tournamentResults)
    } else {
        speech += await handleCupStandings(mappings, tournamentStandings, tournamentResults)
    }

    return speech
}
