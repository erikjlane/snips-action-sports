import { logger, slot, tts, translation } from '../utils'
import { Handler } from './index'
import commonHandler, { KnownSlots } from './common'
import {
    getTournamentStandings,
    TournamentStandingsPayload,
    getTournamentResults,
    TournamentResultsPayload
} from '../api'
import { INTENT_FILTER_PROBABILITY_THRESHOLD } from '../constants'
import { i18nFactory } from '../factories'
import { helpers } from '../utils/sports'
const mapping = require('../../assets/mappings')

export const tournamentStandingHandler: Handler = async function (msg, flow, knownSlots: KnownSlots = { depth: 2 }) {
    const i18n = i18nFactory.get()

    logger.info('TournamentStanding')

    const {
        teams,
        tournament
    } = await commonHandler(msg, knownSlots)

    const validTeam = !slot.missing(teams), validTournament = !slot.missing(tournament)

    // for now, the tournament is required
    if (!validTournament) {
        if (knownSlots.depth === 0) {
            throw new Error('slotsNotRecognized')
        }

        /*
        flow.notRecognized((msg, flow) => {
            knownSlots.depth -= 1
            return tournamentStandingHandler(msg, flow, knownSlots)
        })
        */
        
        flow.continue('snips-assistant:TournamentStanding', (msg, flow) => {
            if (msg.intent.confidenceScore < INTENT_FILTER_PROBABILITY_THRESHOLD) {
                throw new Error('intentNotRecognized')
            }
            
            let slotsToBeSent = {
                teams,
                depth: knownSlots.depth - 1
            }

            return tournamentStandingHandler(msg, flow, slotsToBeSent)
        })

        flow.continue('snips-assistant:Cancel', (_, flow) => {
            flow.end()
        })
        flow.continue('snips-assistant:Stop', (_, flow) => {
            flow.end()
        })

        return i18n('sports.dialog.noTournament')
    } else {
        const now: number = Date.now()

        let teamsId: string[] = []
        let tournamentId: string
        let tournamentResults: TournamentResultsPayload
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

            tournamentStandings = await getTournamentStandings(tournamentId)
            //logger.debug(tournamentStandings)

            //TODO: fix QPS limit
            await new Promise(resolve => setTimeout(resolve, 1000))

            tournamentResults = await getTournamentResults(tournamentId)
            //logger.debug(tournamentResults)

            // regular season
            if (helpers.isRegularSeason(tournamentResults)) {
                // tournament only
                if (teams.length === 0) {
                    speech += translation.tournamentStandingsToSpeech(tournamentStandings)
                }
                // tournament and team
                else if (teams.length > 0) {
                    speech += translation.teamStandingToSpeech(tournamentStandings, tournamentResults, teamsId[0])
                }
            }
            // group phases
            else {
                // tournament only
                if (teams.length === 0) {
                    speech += translation.tournamentStandingsToSpeech(tournamentStandings)
                }
                // tournament and team
                else if (teams.length > 0) {
                    speech += translation.teamStandingToSpeech(tournamentStandings, tournamentResults, teamsId[0])
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