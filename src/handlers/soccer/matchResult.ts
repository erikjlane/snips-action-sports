import { soccerTranslation } from '../../utils/sports/soccer'
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
    let speech: string = ''
    let tournamentResults: TournamentResultsPayload = await getTournamentResults(mappings.tournament.id)

    // keeping ended matches only
    tournamentResults.results = tournamentResults.results.filter(
        r => r.sport_event_status.match_status === 'ended'
    )

    speech += soccerTranslation.tournamentResultsToSpeech(tournamentResults)

    return speech
}

async function handleTeamMatchResults(mappings: Mappings): Promise<string> {
    const i18n = i18nFactory.get()

    let speech: string = ''
    let teamResults: TeamResultsPayload = await getTeamResults(mappings.teams[0].id)

    // keeping ended matches only
    teamResults.results = teamResults.results.filter(
        r => r.sport_event_status.match_status === 'ended'
    )

    if (mappings.tournament) {
        const inTournamentResults = teamResults.results.filter(
            r => r.sport_event.tournament.id === mappings.tournament.id
        )

        if (inTournamentResults.length > 0) {
            teamResults.results = inTournamentResults
        } else {
            speech += i18n('sports.soccer.dialog.teamNeverParticipatedInTournament', {
                team: mappings.teams[0].name,
                tournament: mappings.tournament.name
            })
            speech += ' '
        }
    }

    speech += soccerTranslation.teamResultToSpeech(teamResults.results[0], mappings.teams[0].id)

    return speech
}

async function handleTeamsMatchResults(mappings: Mappings): Promise<string> {
    if (mappings.teams[0].id === mappings.teams[1].id) {
        return handleTeamMatchResults(mappings)
    }

    const i18n = i18nFactory.get()

    let speech: string = ''
    let teamsResults: TeamVsTeamPayload = await getTeamVsTeam(mappings.teams[0].id, mappings.teams[1].id)

    if (teamsResults.message && teamsResults.message === 'No meetings between these teams.') {
        speech = i18n('sports.soccer.dialog.teamsNeverMet', {
            team_1: mappings.teams[0].name,
            team_2: mappings.teams[1].name
        })
    } else {
        // keeping ended matches only
        teamsResults.last_meetings.results = teamsResults.last_meetings.results.filter(
            r => r.sport_event_status.match_status === 'ended'
        )

        if (mappings.tournament) {
            const inTournamentResults = teamsResults.last_meetings.results.filter(
                r => r.sport_event.tournament.id === mappings.tournament.id
            )

            if (inTournamentResults.length > 0) {
                teamsResults.last_meetings.results = inTournamentResults
            } else {
                speech += i18n('sports.soccer.dialog.teamsNeverMetInTournament', {
                    team_1: mappings.teams[0].name,
                    team_2: mappings.teams[1].name,
                    tournament: mappings.tournament.name
                })
                speech += ' '
            }
        }

        speech += soccerTranslation.teamResultToSpeech(teamsResults.last_meetings.results[0], mappings.teams[0].id)
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
