import { logger, slot, tts, translation } from '../utils'
import { Handler } from './index'
import commonHandler, { KnownSlots } from './common'
import {
    TeamSchedulePayload,
    TournamentSchedulePayload,
    getTournamentSchedule,
    getTeamSchedule
} from '../api'
import { i18nFactory } from '../factories'
const mapping = require('../../assets/mappings')

export const nextMatchHandler: Handler = async function (msg, flow, knownSlots: KnownSlots = { depth: 2 }) {
    const i18n = i18nFactory.get()

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
                teamSchedule = await getTeamSchedule(teamsId[0])
                teamSchedule.schedule = teamSchedule.schedule.filter(
                    s => new Date(s.scheduled) > new Date()
                )

                if (validTournament) {
                    const inTournamentSchedules = teamSchedule.schedule.filter(
                        s => s.tournament.id === tournamentId
                    )

                    if (inTournamentSchedules.length > 0) {
                        teamSchedule.schedule = inTournamentSchedules
                    } else {
                        speech += i18n('sports.dialog.teamWillNeverParticipateInTournament', {
                            tournament
                        })
                        speech += ' '
                    }
                }

                speech += translation.teamScheduleToSpeech(teamSchedule, teamsId[0])
            } 

            // two teams + optional tournament
            else {
                teamSchedule = await getTeamSchedule(teamsId[0])
                teamSchedule.schedule = teamSchedule.schedule.filter(
                    s => new Date(s.scheduled) > new Date()
                )

                const nextSchedules = teamSchedule.schedule.filter(
                    s => s.competitors.filter(c => c.id === teamsId[1]).length === 1
                )

                if (nextSchedules.length === 0) {
                    const speech = i18n('sports.dialog.teamsWillNeverMeet')
                    flow.end()
                    logger.info(speech)
                    return speech
                } else {
                    teamSchedule.schedule = nextSchedules

                    if (validTournament) {
                        const inTournamentSchedules = teamSchedule.schedule.filter(
                            s => s.tournament.id === tournamentId
                        )

                        if (inTournamentSchedules.length > 0) {
                            teamSchedule.schedule = inTournamentSchedules
                        } else {
                            speech += i18n('sports.dialog.teamsWillNeverMeetInTournament', {
                                tournament
                            })
                            speech += ' '
                        }
                    }

                    speech += translation.teamScheduleToSpeech(teamSchedule, teamsId[0])
                }
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
