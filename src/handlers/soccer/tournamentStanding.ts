import { helpers, soccerTranslation } from '../../utils/sports/soccer'
import {
    getTournamentStandings,
    getTournamentResults,
    TournamentStandingsPayload,
    TournamentResultsPayload
} from '../../api/soccer'
import { Mappings } from '../../utils/sports/reader'
import { i18n } from 'snips-toolkit'

/**
 * 
 * @param mappings 
 * @param standings 
 * @param results 
 */
async function handleLeagueStandings(mappings: Mappings, standings: TournamentStandingsPayload, results: TournamentResultsPayload): Promise<string> {
    let speech: string = ''

    if (mappings.teams.length > 0) {
        if (helpers.noResultFromTeam(results.results, mappings.teams[0].id)) {
            speech += i18n.translate('sports.soccer.dialog.teamDoesntParticipateInTournament', {
                team: mappings.teams[0].name,
                tournament: mappings.tournament.name
            })
            speech += ' '
        } else {
            return soccerTranslation.leagueTeamStandingToSpeech(standings, mappings.teams[0].id)
        }
    }

    speech += soccerTranslation.leagueStandingsToSpeech(standings)

    return speech
}

/**
 * 
 * @param mappings 
 * @param standings 
 * @param results 
 */
async function handleGroupsStandings(mappings: Mappings, standings: TournamentStandingsPayload, results: TournamentResultsPayload): Promise<string> {
    let speech: string = ''

    if (mappings.teams.length > 0) {
        if (helpers.noResultFromTeam(results.results, mappings.teams[0].id)) {
            speech += i18n.translate('sports.soccer.dialog.teamDoesntParticipateInTournament', {
                team: mappings.teams[0].name,
                tournament: mappings.tournament.name
            })
            speech += ' '
        } else {
            if (helpers.finalPhaseStarted(results)) {
                return await handleCupStandings(mappings, results)
            } else {
                return soccerTranslation.groupsTeamStandingToSpeech(standings, mappings.teams[0].id)
            }
        }
    }

    if (helpers.finalPhaseStarted(results)) {
        speech += await handleCupStandings(mappings, results)
    } else {
        speech += soccerTranslation.groupsStandingsToSpeech(standings)
    }

    return speech
}

/**
 * 
 * @param mappings 
 * @param results 
 */
async function handleCupStandings(mappings: Mappings, results: TournamentResultsPayload) : Promise<string> {
    const round = helpers.getHighestFinalPhase(results)

    let speech: string = ''

    if (mappings.teams.length > 0) {
        if (helpers.noResultFromTeam(results.results, mappings.teams[0].id)) {
            speech += i18n.translate('sports.soccer.dialog.teamDoesntParticipateInTournament', {
                team: mappings.teams[0].name,
                tournament: mappings.tournament.name
            })
            speech += ' '
        } else {
            const resultsInRound = helpers.getResultsFromRound(results.results, round)
            results.results = helpers.getResultsFromTeam(resultsInRound, mappings.teams[0].id)

            const result = (results.results.length !== 0)
                ? results.results[results.results.length - 1]
                : null

            return soccerTranslation.cupTeamStandingToSpeech(result, round, mappings.teams[0].id)
        }
    }

    results.results = helpers.getResultsFromRound(results.results, round)
    speech += soccerTranslation.cupStandingsToSpeech(results, round)

    return speech
}

export const soccerTournamentStanding = async function(mappings: Mappings): Promise<string> {
    const i18n = i18nFactory.get()

    let speech: string = ''
    let standings: TournamentStandingsPayload

    try {
        standings = await getTournamentStandings(mappings.tournament.id)
    } catch (err) {
        if (err.name === 'NotInProgressError') {
            return i18n('sports.soccer.tournamentStandings.notInProgress', {
                tournament: mappings.tournament.name
            })
        }
    }
    
    //TODO: fix QPS limit
    await new Promise(resolve => setTimeout(resolve, 1000))
    const results = await getTournamentResults(mappings.tournament.id)

    if (helpers.isLeague(results)) {
        speech = await handleLeagueStandings(mappings, standings, results)
    } else {
        speech = await handleGroupsStandings(mappings, standings, results)
    }

    return speech
}
