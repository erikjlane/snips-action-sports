import { TournamentStandingsPayload, TournamentResultsPayload } from '../../api'

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

        return (standings as TournamentResultsPayload).results.find(result => result.sport_event.tournament_round.phase !== 'regular season') === undefined
    },

    isCup: (standings: TournamentResultsPayload | TournamentStandingsPayload): boolean => {
        return !helpers.isLeague(standings)
    }
}