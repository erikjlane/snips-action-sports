import { translation } from '../../utils'
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

export const soccerMatchResult = async function(mappings: Mappings): Promise<string> {
    const i18n = i18nFactory.get()

    let speech: string = ''

    let teamResults: TeamResultsPayload
    let teamsResults: TeamVsTeamPayload
    let tournamentResults: TournamentResultsPayload

    // tournament only
    if (mappings.teams.length === 0) {
        tournamentResults = await getTournamentResults(mappings.tournament.id)
        tournamentResults.results = tournamentResults.results.filter(
            r => r.sport_event_status.match_status === 'ended'
        )

        speech += translation.tournamentResultsToSpeech(tournamentResults)
    }
    
    // one team + optional tournament
    else if (mappings.teams.length === 1) {
        teamResults = await getTeamResults(mappings.teams[0].id)
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
                speech += i18n('sports.dialog.teamNeverParticipatedInTournament', {
                    team: mappings.teams[0].name,
                    tournament: mappings.tournament.name
                })
                speech += ' '
            }
        }

        speech += translation.teamResultToSpeech(teamResults.results[0], mappings.teams[0].id)
    } 

    // two teams + optional tournament
    else {
        teamsResults = await getTeamVsTeam(mappings.teams[0].id, mappings.teams[1].id)

        if (teamsResults.message && teamsResults.message === 'No meetings between these teams.') {
            speech = i18n('sports.dialog.teamsNeverMet')
        } else {
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
                    speech += i18n('sports.dialog.teamsNeverMetInTournament', {
                        tournament: mappings.tournament.name
                    })
                    speech += ' '
                }
            }

            speech += translation.teamResultToSpeech(teamsResults.last_meetings.results[0], mappings.teams[0].id)
        }
    }

    return speech
}