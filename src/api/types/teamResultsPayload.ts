interface Team {
    id: string;
    name: string;
    country: string;
    country_code: string;
    abbreviation: string;
}

interface TournamentRound {
    type: string;
    number: number;
    phase: string;
    name: string;
    cup_round_match_number?: number;
    cup_round_matches?: number;
    other_match_id: string;
}

interface Season {
    id: string;
    name: string;
    start_date: string;
    end_date: string;
    year: string;
    tournament_id: string;
}

interface Sport {
    id: string;
    name: string;
}

interface Category {
    id: string;
    name: string;
    country_code: string;
}

interface Tournament {
    id: string;
    name: string;
    sport: Sport;
    category: Category;
}

interface Competitor {
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

interface SportEvent {
    id: string;
    scheduled: Date;
    start_time_tbd: boolean;
    tournament_round: TournamentRound;
    season: Season;
    tournament: Tournament;
    competitors: Competitor[];
    venue: Venue;
}

interface PeriodScore {
    home_score: number;
    away_score: number;
    type: string;
    number: number;
}

interface SportEventStatus {
    status: string;
    match_status: string;
    home_score: number;
    away_score: number;
    winner_id: string;
    period_scores: PeriodScore[];
    aggregate_home_score?: number;
    aggregate_away_score?: number;
    aggregate_winner_id: string;
}

interface Result {
    sport_event: SportEvent;
    sport_event_status: SportEventStatus;
}

export interface TeamResultsPayload {
    generated_at: Date;
    schema: string;
    team: Team;
    results: Result[];
}

