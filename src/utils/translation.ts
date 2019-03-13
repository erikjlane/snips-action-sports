import { i18nFactory } from '../factories/i18nFactory'
import { isTournamentEnded } from './sports'
import { logger } from './logger'
import { beautify } from './beautify'
import { Result, Competitor } from '../api'

export const translation = {
    // Outputs an error message based on the error object, or a default message if not found.
    errorMessage: async (error: Error): Promise<string> => {
        let i18n = i18nFactory.get()

        if(!i18n) {
            await i18nFactory.init()
            i18n = i18nFactory.get()
        }

        if(i18n) {
            return i18n([`error.${error.message}`, 'error.unspecific'])
        } else {
            return 'Oops, something went wrong.'
        }
    },
    // Takes an array from the i18n and returns a random item.
    randomTranslation (key: string | string[], opts: {[key: string]: any}): string {
        const i18n = i18nFactory.get()
        const possibleValues = i18n(key, { returnObjects: true, ...opts })
        if (typeof possibleValues === 'string')
            return possibleValues
        const randomIndex = Math.floor(Math.random() * possibleValues.length)
        return possibleValues[randomIndex]
    },

    tournamentStandingsToSpeech(team: string, tournament: string, standingsData): string {
        const i18n = i18nFactory.get()

        let speech = ''

        const groups = standingsData.standings[0].groups
        const groupData = groups.find(groupMapping => groupMapping.team_standings.some(teamMapping => teamMapping.team.name.includes(team)))
        const teamData = groupData.team_standings.find(teamData => teamData.team.name.includes(team))

        logger.info(teamData)

        if (isTournamentEnded(standingsData)) {
            speech = i18n('sports.tournamentStandings.rankEnded', {
                team,
                tournament,
                rank: teamData.rank
            })
        } else {
            speech = i18n('sports.tournamentStandings.rankNotEnded', {
                team,
                tournament,
                rank: teamData.rank
            })
        }

        return speech
    },

    teamResultToSpeech (result: Result, teamsId: string[] = undefined, from: Date = undefined, to: Date = undefined): string {
        const i18n = i18nFactory.get()

        let speech = '', team1: Competitor, team2: Competitor

        const scheduled: Date = new Date(result.sport_event.scheduled)
        if (from && to && (scheduled < from || scheduled > to)) {
            speech += i18n('sports.matchResults.periodDoesntMatch')
            speech += ' '
        }

        if (teamsId) {
            team1 = result.sport_event.competitors.find(competitor => competitor.id === teamsId[0])
            team2 = result.sport_event.competitors.find(competitor => competitor.id !== team1.id)
        } else {
            team1 = result.sport_event.competitors[0]
            team2 = result.sport_event.competitors[1]
        }

        const team1Score = result.sport_event_status[team1.qualifier + '_score']
        const team2Score = result.sport_event_status[team2.qualifier + '_score']

        logger.debug(team1)
        logger.debug(team2)

        const key = (team1Score === team2Score)
            ? 'sports.matchResults.teamTied'
            : ((team1Score < team2Score) ? 'sports.matchResults.teamLost' : 'sports.matchResults.teamWon')

        speech += i18n(key, {
            tournament: result.sport_event.tournament.name,
            team_1: team1.name,
            team_2: team2.name,
            date: beautify.date(scheduled),
            team_1_score: team1Score,
            team_2_score: team2Score
        })

        return speech
    },

    tournamentResultsToSpeech (results: Result[], from: Date = undefined, to: Date = undefined): string {
        let speech = ''

        if (from && to) {
            results = results.filter(result => from < result.sport_event.scheduled && to > result.sport_event.scheduled)
            for (let result of results) {
                speech += translation.teamResultToSpeech(result)
                speech = ' '
            }
        } else {
            for (let i = results.length - 1; i > results.length - 1 - 3; i--) {
                speech += translation.teamResultToSpeech(results[i])
                speech += ' '
            }
        }

        return speech
    }
}
