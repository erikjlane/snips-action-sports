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

    constructor(teams: TeamMapping[], tournament: TournamentMapping) {
        this.teams = teams
        this.tournament = tournament
    }
}

export const reader = async function (teamNames: string[], tournamentName: string): Promise<Mappings> {
    const validTeam = !slot.missing(teamNames), validTournament = !slot.missing(tournamentName)

    let teams: TeamMapping[] = []
    let tournament: TournamentMapping

    // Searching for the teams ids
    if (validTeam) {
        for (let teamName of teamNames) {
            const matchingTeam = mapping.teams.find(t => t.name.includes(teamName))
            if (!matchingTeam || !matchingTeam.id) {
                throw new Error('team')
            }
    
            teams.push(matchingTeam)
            logger.debug(matchingTeam)
        }
    }
    
    // Searching for the tournament id
    if (validTournament) {
        const matchingTournament = mapping.tournaments.find(t => t.name.includes(tournamentName))
        if (!matchingTournament || !matchingTournament.id) {
            throw new Error('tournament')
        }

        tournament = matchingTournament
        logger.debug(tournament)
    }

    return new Mappings(teams, tournament)
}