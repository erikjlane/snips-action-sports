export function isTournamentEnded(standingsData): boolean {
    if (standingsData.tournament && standingsData.tournament.current_season) {
        const endDate = standingsData.tournament.current_season.end_date
        if (endDate) {
            return Date.now() > Date.parse(endDate)
        }
    }

    return false
}