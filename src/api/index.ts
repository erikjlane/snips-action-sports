import { http } from 'snips-toolkit'
import { BASE_URL } from '../constants'

export let request = http(BASE_URL)

export * from './soccer'
export * from './nba'