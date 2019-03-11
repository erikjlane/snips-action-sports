import { i18nFactory } from '../factories/i18nFactory'
import { isTournamentEnded } from './sports'
import { logger } from './logger'
import { beautify } from './beautify'

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

    teamResultsToSpeech (team: string, tournament: string, resultsData): string {
        const i18n = i18nFactory.get()

        let speech = ''

        if (!tournament) {
            const team_1_qualifier = resultsData.results[0].sport_event.competitors[0].qualifier + '_score'
            const team_2_qualifier = resultsData.results[0].sport_event.competitors[1].qualifier + '_score'

            speech = i18n('sports.matchResults.lastMatchForTeam', {
                team_1: resultsData.results[0].sport_event.competitors[0].name,
                team_2: resultsData.results[0].sport_event.competitors[1].name,
                date: beautify.date(new Date(resultsData.results[0].sport_event.scheduled)),
                team_1_score: resultsData.results[0].sport_event_status[team_1_qualifier],
                team_2_score: resultsData.results[0].sport_event_status[team_2_qualifier]
            })
        }

        return speech
    }
}
