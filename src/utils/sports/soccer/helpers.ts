import { TournamentStandingsPayload, TournamentResultsPayload, TournamentRound } from '../../../api'

export const helpers = {
    isTournamentEnded: (standings: TournamentStandingsPayload): boolean => {
        if (standings.tournament && standings.tournament.current_season) {
            const endDate = standings.tournament.current_season.end_date
    
            if (endDate) {
                return new Date() > endDate
            }
        }
    
        return false
    },

    isLeague: (standings: TournamentResultsPayload | TournamentStandingsPayload): boolean => {
        if (standings.hasOwnProperty('standings')) {
            return (standings as TournamentStandingsPayload).standings[0].groups.length === 1
        }

        // a league contains only one group
        return (standings as TournamentResultsPayload).results.find(
            r => r.sport_event.tournament_round.type !== 'group'
        ) === undefined
    },

    isCup: (standings: TournamentResultsPayload | TournamentStandingsPayload): boolean => {
        return !helpers.isLeague(standings)
    },

    finalPhaseStarted: (results: TournamentResultsPayload): boolean => {
        return helpers.isCup(results) && results.results.filter(
            r => r.sport_event.tournament_round.type === 'cup'
        ).length !== 0
    },

    getHighestFinalPhase: (results: TournamentResultsPayload): TournamentRound => {
        let finalPhase: TournamentRound

        const phases = [
            'round_of_16'
        ]

        for (let result of results.results) {
            let round = result.sport_event.tournament_round

            if (round.type === 'cup' && round.phase === 'final_phase') {
                if (
                    finalPhase === undefined ||
                    (phases.indexOf(round.name) >   phases.indexOf(finalPhase.name)) ||
                    (phases.indexOf(round.name) === phases.indexOf(finalPhase.name) && round.cup_round_match_number > finalPhase.cup_round_match_number)
                ) {
                    finalPhase = round
                }
            }
        }

        return finalPhase
    },

    getMatchesFromRound: (results: TournamentResultsPayload, round: TournamentRound): TournamentResultsPayload => {
        results.results = results.results.filter(
            r => {
                const currentRound = r.sport_event.tournament_round
                return currentRound.type === round.type && currentRound.phase === round.phase && currentRound.cup_round_match_number === round.cup_round_match_number
            }
        )

        return results
    },

    getMatchesFromTeam: (results: TournamentResultsPayload, teamId: string): TournamentResultsPayload => {
        results.results = results.results.filter(
            r => r.sport_event.competitors.filter(c => c.id === teamId).length === 1
        )

        return results
    }
}