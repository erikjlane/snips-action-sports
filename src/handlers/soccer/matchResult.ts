import { soccerTranslation, helpers } from '../../utils/sports/soccer'
import { i18nFactory } from '../../factories'
import {
    getTeamResults,
    getTournamentResults,
    TeamResultsPayload,
    TournamentResultsPayload,
    getTeamVsTeam,
    TeamVsTeamPayload
} from '../../api/soccer'
import { Mappings } from '../../utils/sports'

async function handleTournamentMatchResults(mappings: Mappings): Promise<string> {
    const i18n = i18nFactory.get()

    let speech: string = ''
    let tournamentResults: TournamentResultsPayload = await getTournamentResults(mappings.tournament.id)

    // keeping ended matches only
    tournamentResults.results = helpers.getEndedResults(tournamentResults.results)

    if (tournamentResults.results.length === 0) {
        speech = i18n('sports.soccer.tournamentResults.notInProgress', {
            tournament: tournamentResults.tournament.name
        })
    } else {
        speech = soccerTranslation.tournamentResultsToSpeech(tournamentResults)
    }

    return speech
}

async function handleTeamMatchResults(mappings: Mappings): Promise<string> {
    const i18n = i18nFactory.get()

    let speech: string = ''
    let results: TeamResultsPayload = await getTeamResults(mappings.teams[0].id)

    // keeping ended matches only
    results.results = helpers.getEndedResults(results.results)

    if (mappings.tournament) {
        // keeping matches of tournament only
        const inTournamentResults = helpers.getResultsFromTournament(results.results, mappings.tournament.id)

        if (inTournamentResults.length > 0) {
            results.results = inTournamentResults
        } else {
            speech += i18n('sports.soccer.dialog.teamNeverParticipatedInTournament', {
                team: mappings.teams[0].name,
                tournament: mappings.tournament.name
            })
            speech += ' '
        }
    }

    speech += soccerTranslation.teamResultToSpeech(results.results[0], mappings.teams[0].id)

    return speech
}

async function handleTeamsMatchResults(mappings: Mappings): Promise<string> {
    if (mappings.teams[0].id === mappings.teams[1].id) {
        return handleTeamMatchResults(mappings)
    }

    const i18n = i18nFactory.get()

    let speech: string = ''
    let results: TeamVsTeamPayload = await getTeamVsTeam(mappings.teams[0].id, mappings.teams[1].id)

    if (results.message && results.message === 'No meetings between these teams.') {
        speech = i18n('sports.soccer.dialog.teamsNeverMet', {
            team_1: mappings.teams[0].name,
            team_2: mappings.teams[1].name
        })
    } else {
        // keeping ended matches only
        results.last_meetings.results = helpers.getEndedResults(results.last_meetings.results)

        if (mappings.tournament) {
            // keeping matches of tournament only
            const inTournamentResults = helpers.getResultsFromTournament(results.last_meetings.results, mappings.tournament.id)

            if (inTournamentResults.length > 0) {
                results.last_meetings.results = inTournamentResults
            } else {
                speech += i18n('sports.soccer.dialog.teamsNeverMetInTournament', {
                    team_1: mappings.teams[0].name,
                    team_2: mappings.teams[1].name,
                    tournament: mappings.tournament.name
                })
                speech += ' '
            }
        }

        speech += soccerTranslation.teamResultToSpeech(results.last_meetings.results[0], mappings.teams[0].id)
    }

    return speech
}

export const soccerMatchResult = async function(mappings: Mappings): Promise<string> {
    let speech: string = ''

    switch (mappings.teams.length) {
        // one tournament
        case 0: {
            speech += await handleTournamentMatchResults(mappings)
            break
        }
        // one team + optional tournament
        case 1: {
            speech += await handleTeamMatchResults(mappings)
            break
        }
        // two teams + optional tournament
        case 2: {
            speech += await handleTeamsMatchResults(mappings)
            break
        }
    }

    return speech
}
