import { logger, slot, tts, translation } from '../utils'
import { Handler } from './index'
import commonHandler, { KnownSlots } from './common'
import {
    TeamSchedulePayload,
    TournamentSchedulePayload,
    getTournamentSchedule
} from '../api'
const mapping = require('../../assets/mappings')

export const nextMatchHandler: Handler = async function (msg, flow, knownSlots: KnownSlots = { depth: 2 }) {
    logger.info('NextMatch')

    const {
        teams,
        tournament
    } = await commonHandler(msg, knownSlots)

    // At least one required slot is missing
    const validTeam = !slot.missing(teams), validTournament = !slot.missing(tournament)

    if (!validTeam && !validTournament) {
        throw new Error('intentNotRecognized')
    } else {
        const now = Date.now()

        let teamsId: string[] = []
        let tournamentId: string
        let teamSchedule: TeamSchedulePayload
        let tournamentSchedule: TournamentSchedulePayload

        // Searching for the teams id
        if (validTeam) {
            for (let team of teams) {
                const matchingTeam = mapping.teams.find(t => t.name.includes(team))
                if (!matchingTeam || !matchingTeam.id) {
                    throw new Error('team')
                }
        
                teamsId.push(matchingTeam.id)
                logger.info(matchingTeam.id)
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

        try {
            let speech: string = ''
            
            // tournament only
            if (teams.length === 0) {
                tournamentSchedule = await getTournamentSchedule(tournamentId)
                speech += translation.tournamentScheduleToSpeech(tournamentSchedule)
            }
            
            // one team + optional tournament
            else if (teams.length === 1) {


                if (validTournament) {
                    
                } else {

                }
            } 

            // two teams + optional tournament
            else {
                /*
                teamsResults = await getTeamVsTeam(teamsId[0], teamsId[1])
                logger.debug(teamsResults)

                if (teamsResults.message && teamsResults.message === 'No meetings between these teams.') {
                    const speech = i18n('sports.dialog.teamsNeverMet')
                    flow.end()
                    logger.info(speech)
                    return speech
                } else {
                    if (validTournament) {
                        
                    } else {

                    }
                }
                */
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
