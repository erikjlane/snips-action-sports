import { slot } from '../slot'
import { logger } from '../logger'
const mapping = require('../../../assets/mappings.json')

export const reader = async function (teams: string[], tournament: string) {
    const validTeam = !slot.missing(teams), validTournament = !slot.missing(tournament)

    let teamsId: string[] = []
    let tournamentId: string

    // Searching for the teams ids
    if (validTeam) {
        for (let team of teams) {
            const matchingTeam = mapping.teams.find(t => t.name.includes(team))
            if (!matchingTeam || !matchingTeam.id) {
                throw new Error('team')
            }
    
            teamsId.push(matchingTeam.id)
            logger.debug(matchingTeam.id)
        }
    }
    
    // Searching for the tournament id
    if (validTournament) {
        const matchingTournament = mapping.tournaments.find(t => t.name.includes(tournament))
        if (!matchingTournament || !matchingTournament.id) {
            throw new Error('tournament')
        }

        tournamentId = matchingTournament.id
        logger.debug(tournamentId)
    }

    return { teamsId, tournamentId }
}