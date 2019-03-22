import { slot } from '../slot'
import { logger } from '../logger'
const mapping = require('../../../assets/mappings.json')

export type SportMapping = {
    id:     string,
    name:   string
}

export type TeamMapping = {
    id:     string,
    name:   string,
    sport:  SportMapping
}

export type TournamentMapping = {
    id:     string,
    name:   string,
    sport:  SportMapping
}

export class Mappings {
    teams:      TeamMapping[];
    tournament: TournamentMapping;
    sport:      SportMapping;

    constructor(teams: TeamMapping[], tournament: TournamentMapping, sport: SportMapping) {
        this.teams = teams
        this.tournament = tournament
        this.sport = sport
    }
}

export const reader = function (teamNames: string[], tournamentName: string): Mappings {
    let teams: TeamMapping[] = []
    let tournament: TournamentMapping
    let sport: SportMapping

    // Searching for the teams ids
    if (!slot.missing(teamNames)) {
        for (let teamName of teamNames) {
            const matchingTeam = mapping.teams.find(
                t => t.name.includes(teamName) || teamName.includes(t.name)
            )

            if (!matchingTeam || !matchingTeam.id) {
                throw new Error('team')
            }
    
            teams.push(matchingTeam)
            logger.debug(matchingTeam)
        }
    }
    
    // Searching for the tournament id
    if (!slot.missing(tournamentName)) {
        const matchingTournament = mapping.tournaments.find(
            t => t.name.includes(tournamentName)
        )
        
        if (!matchingTournament || !matchingTournament.id) {
            throw new Error('tournament')
        }

        tournament = matchingTournament
        logger.debug(tournament)
    }

    if (teams.length > 0) {
        sport = teams[0].sport
    } else {
        sport = tournament.sport
    }

    return new Mappings(teams, tournament, sport)
}