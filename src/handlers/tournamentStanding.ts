import { logger, slot, tts, translation } from '../utils'
import { Handler } from './index'
import commonHandler, { KnownSlots } from './common'
import { getTournamentStandings, getTeamSchedule, TournamentStandingsPayload, TeamSchedulePayload } from '../api'
const mapping = require('../../assets/mappings')

export const tournamentStandingHandler: Handler = async function (msg, flow, knownSlots: KnownSlots = { depth: 2 }) {
    logger.info('TournamentStanding')

    const {
        team,
        tournament
    } = await commonHandler(msg, knownSlots)

    const validTeam = !slot.missing(team), validTournament = !slot.missing(tournament)

    if (!validTeam && !validTournament) {
        throw new Error('intentNotRecognized')
    } else {
        const now = Date.now()

        let tournamentId: string

        let teamScheduleData: TeamSchedulePayload
        let tournamentStandings: TournamentStandingsPayload

        // Searching for the id team
        if (validTeam) {
            const matchingTeam = mapping.teams.find(teamMapping => teamMapping.name.includes(team))
            if (!matchingTeam) {
                throw new Error('team')
            }
    
            const teamId = matchingTeam.id
            if (!teamId) {
                throw new Error('team')
            }
    
            logger.info(teamId)

            if (!validTournament) {
                // API call
                teamScheduleData = await getTeamSchedule(teamId)
                logger.info(teamScheduleData)

                tournamentId = teamScheduleData.schedule[0].tournament.id
            }
        }
        
        // Searching for the id tournament/league
        if (validTournament) {
            const matchingTournament = mapping.tournaments.find(tournamentMapping => tournamentMapping.name.includes(tournament))
            if (!matchingTournament) {
                throw new Error('tournament')
            }

            tournamentId = matchingTournament.id
        }

        if (!tournamentId) {
            throw new Error('tournament')
        }
        logger.info(tournamentId)

        // API call
        tournamentStandings = await getTournamentStandings(tournamentId)
        logger.info(tournamentStandings)

        try {
            const speech = translation.tournamentStandingsToSpeech(team, tournament, tournamentStandings)
            logger.info(speech)
        
            flow.end()
            if (Date.now() - now < 4000) {
                return speech
            } else {
                tts.say(speech)
            }
        } catch (error) {
            logger.error(error)
            throw new Error('APIResponse')
        }
    }
}