import {
    TournamentStandingsPayload,
    TournamentResultsPayload,
    TournamentRound,
    TeamSchedulePayload,
    TournamentSchedulePayload,
    Result
} from '../../../api'

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

    getTournamentFutureEvents: (schedule: TournamentSchedulePayload): TournamentSchedulePayload => {
        const now = new Date()

        schedule.sport_events = schedule.sport_events.filter(
            e => new Date(e.scheduled) > now
        )

        return schedule
    },

    getTeamFutureEvents: (schedule: TeamSchedulePayload): TeamSchedulePayload => {
        const now = new Date()

        schedule.schedule = schedule.schedule.filter(
            s => new Date(s.scheduled) > now
        )

        return schedule
    },

    isLeague: (standings: TournamentResultsPayload | TournamentStandingsPayload): boolean => {
        if (standings.hasOwnProperty('standings')) {
            return (standings as TournamentStandingsPayload).standings[0].groups.length === 1
        } else {
            // a league contains only one group
            return (standings as TournamentResultsPayload).results.find(
                r => r.sport_event.tournament_round.type !== 'group'
            ) === undefined
        }
    },

    isCup: (standings: TournamentResultsPayload | TournamentStandingsPayload): boolean => {
        return !helpers.isLeague(standings)
    },

    finalPhaseStarted: (results: TournamentResultsPayload): boolean => {
        return helpers.isCup(results) && results.results.filter(
            r => r.sport_event.tournament_round.type === 'cup'
        ).length !== 0
    },

    getHighestFinalPhase: (results: TournamentResultsPayload): TournamentRound | undefined => {
        let finalPhase: TournamentRound

        const phases = [
            'round_of_16',
            'quarterfinal',
            'semifinal',
            'final'
        ]

        for (let result of results.results) {
            let round = result.sport_event.tournament_round

            //TODO phase attribute has been deleted in the API
            if (round.type === 'cup' /*&& round.phase === 'final_phase'*/) {
                if (
                    !finalPhase ||
                    (phases.indexOf(round.name) > phases.indexOf(finalPhase.name)) ||
                    (phases.indexOf(round.name) === phases.indexOf(finalPhase.name) && round.cup_round_match_number > finalPhase.cup_round_match_number)
                ) {
                    finalPhase = round
                }
            }
        }

        return finalPhase
    },

    getResultsFromRound: (results: Result[], round: TournamentRound): Result[] => {
        return results.filter(
            r => {
                const cr = r.sport_event.tournament_round
                return cr.type === round.type && cr.name === round.name && cr.phase === round.phase && cr.cup_round_match_number === round.cup_round_match_number
            }
        )
    },

    getResultsFromTeam: (results: Result[], teamId: string): Result[] => {
        return results.filter(
            r => r.sport_event.competitors.filter(c => c.id === teamId).length === 1
        )
    },

    noResultFromTeam: (results: Result[], teamId: string): boolean => {
        return helpers.getResultsFromTeam(results, teamId).length === 0
    },

    getResultsFromTournament: (results: Result[], tournamentId: string): Result[] => {
        return results.filter(
            r => r.sport_event.tournament.id === tournamentId
        )
    },

    getEndedResults: (results: Result[]): Result[] => {
        return results.filter(
            r => r.sport_event_status.match_status === 'ended'
        )
    }
}