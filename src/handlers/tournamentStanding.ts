import { logger, slot, tts, translation } from '../utils'
import { Handler } from './index'
import commonHandler, { KnownSlots } from './common'
import { getTournamentStandings, TournamentStandingsPayload } from '../api'
const mapping = require('../../assets/mappings')

export const tournamentStandingHandler: Handler = async function (msg, flow, knownSlots: KnownSlots = { depth: 2 }) {
    logger.info('TournamentStanding')

    const {
        teams,
        tournament
    } = await commonHandler(msg, knownSlots)

    const validTeam = !slot.missing(teams), validTournament = !slot.missing(tournament)

    if (!validTeam && !validTournament) {
        throw new Error('intentNotRecognized')
    } else {
        const now: number = Date.now()

        let teamsId: string[] = []
        let tournamentId: string
        //let teamScheduleData: TeamSchedulePayload
        let tournamentStandings: TournamentStandingsPayload

        // Searching for the teams id
        if (validTeam) {
            for (let team of teams) {
                const matchingTeam = mapping.teams.find(teamMapping => teamMapping.name.includes(team))
                if (!matchingTeam || !matchingTeam.id) {
                    throw new Error('team')
                }
        
                teamsId.push(matchingTeam.id)
                logger.debug(matchingTeam.id)
            }
        }
        
        // Searching for the tournament id
        if (validTournament) {
            const matchingTournament = mapping.tournaments.find(tournamentMapping => tournamentMapping.name.includes(tournament))
            if (!matchingTournament || !matchingTournament.id) {
                throw new Error('tournament')
            }

            tournamentId = matchingTournament.id
            logger.debug(tournamentId)
        }

        try {
            let speech: string = ''

            // tournament only
            if (teams.length === 0) {
                tournamentStandings = await getTournamentStandings(tournamentId)
                logger.debug(tournamentStandings)

                speech += translation.tournamentStandingsToSpeech(tournamentStandings)
            }

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