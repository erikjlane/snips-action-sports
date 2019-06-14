interface Team {
    id: string;
    name: string;
    country?: string;
    country_code?: string;
    abbreviation?: string;
}

interface Sport {
    id: string;
    name: string;
}

interface Category {
    id: string;
    name: string;
    country_code?: string;
}

interface Tournament {
    id: string;
    name: string;
    sport: Sport;
    category: Category;
    current_season?: CurrentSeason;
}

export interface TournamentRound {
    type: string;
    number?: number;
    phase?: string;
    name?: string;
    cup_round_match_number?: number;
    cup_round_matches?: number;
    other_match_id?: string;
    group?: string;
}

interface Season {
    id: string;
    name: string;
    start_date: string;
    end_date: string;
    year: string;
    tournament_id: string;
}

export interface Competitor {
    id: string;
    name: string;
    country: string;
    country_code: string;
    abbreviation: string;
    qualifier: string;
}

interface Venue {
    id: string;
    name: string;
    capacity: number;
    city_name: string;
    country_name: string;
    map_coordinates: string;
    country_code: string;
}

interface CurrentSeason {
    id: string;
    name: string;
    start_date: Date;
    end_date: Date;
    year: string;
}

export interface TeamStanding {
    team: Team;
    rank: number;
    current_outcome: string;
    played: number;
    win: number;
    draw: number;
    loss: number;
    goals_for: number;
    goals_against: number;
    goal_diff: number;
    points: number;
    change: number;
}

export interface Group {
    name: string;
    id: string;
    team_standings: TeamStanding[];
}

export interface Standing {
    tie_break_rule: string;
    type: string;
    groups: Group[];
}

interface SportEvent {
    id: string;
    scheduled: Date;
    start_time_tbd: boolean;
    status?: string;
    tournament_round?: TournamentRound;
    season: Season;
    tournament: Tournament;
    competitors: Competitor[];
    venue?: Venue;
}

interface PeriodScore {
    home_score: number;
    away_score: number;
    type: string;
    number: number;
}

interface SportEventStatus {
    status: string;
    match_status?: string;
    home_score?: number;
    away_score?: number;
    winner_id?: string;
    period_scores?: PeriodScore[];
    aggregate_home_score?: number;
    aggregate_away_score?: number;
    aggregate_winner_id?: string;
}

interface NextMeeting {
    sport_event: SportEvent;
}

interface LastMeetings {
    results: Result[];
}

export interface Schedule {
    id: string;
    scheduled: Date;
    start_time_tbd: boolean;
    status: string;
    tournament_round: TournamentRound;
    season: Season;
    tournament: Tournament;
    competitors: Competitor[];
    venue: Venue;
}

export interface Result {
    sport_event: SportEvent;
    sport_event_status: SportEventStatus;
}

export interface TournamentResultsPayload {
    generated_at: Date;
    schema: any;
    message?: string;
    tournament?: Tournament;
    results?: Result[];
}

export interface TeamResultsPayload {
    generated_at: Date;
    schema: string;
    team: Team;
    results: Result[];
}

export interface TournamentStandingsPayload {
    generated_at: Date;
    schema: string;
    message?: string;
    tournament?: Tournament;
    season?: Season;
    standings?: Standing[];
}

export interface TournamentSchedulePayload {
    generated_at: Date;
    schema: string;
    tournament: Tournament;
    sport_events: SportEvent[];
}

export interface TeamVsTeamPayload {
    generated_at: Date;
    schema: string;
    teams: Team[];
    last_meetings: LastMeetings;
    next_meetings: NextMeeting[];
    message?: string;
}

export interface TeamSchedulePayload {
    generated_at: Date;
    schema: string;
    team: Team;
    schedule: Schedule[];
}