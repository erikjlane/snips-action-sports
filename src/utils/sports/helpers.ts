import { TournamentStandingsPayload } from '../../api'

export function isTournamentEnded(standings: TournamentStandingsPayload): boolean {
    if (standings.tournament && standings.tournament.current_season) {
        const endDate = standings.tournament.current_season.end_date

        if (endDate) {
            return new Date() > endDate
        }
    }

    return false
}