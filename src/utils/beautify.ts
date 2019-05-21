import { config, i18n } from 'snips-toolkit'
import moment from 'moment'
import 'moment/locale/fr'

export const beautify = {    
    date: (date: Date): string => {
        return moment(date).locale(config.get().locale).calendar(null, {
            lastDay: i18n.translate('moment.lastDay'),
            sameDay: i18n.translate('moment.sameDay'),
            nextDay: i18n.translate('moment.nextDay'),
            nextWeek: i18n.translate('moment.nextWeek'),
            lastWeek: i18n.translate('moment.lastWeek'),
            sameElse: i18n.translate('moment.sameElse'),
        })
    },

    time: (date: Date): string => {
        return moment(date)
            .locale(config.get().locale)
            .format(i18n.translate('moment.time'))
            .replace(' 0', '')
    }
}
