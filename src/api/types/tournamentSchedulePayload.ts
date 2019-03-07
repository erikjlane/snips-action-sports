interface Sport {
    id: string;
    name: string;
}

interface Category {
    id: string;
    name: string;
}

interface Tournament {
    id: string;
    name: string;
    sport: Sport;
    category: Category;
}

interface TournamentRound {
    type: string;
    name: string;
    cup_round_match_number: number;
    cup_round_matches: number;
    phase: string;
    number?: number;
    other_match_id: string;
    group: string;
}

interface Season {
    id: string;
    name: string;
    start_date: string;
    end_date: string;
    year: string;
    tournament_id: string;
}

interface Sport2 {
    id: string;
    name: string;
}

interface Category2 {
    id: string;
    name: string;
}

interface Tournament2 {
    id: string;
    name: string;
    sport: Sport2;
    category: Category2;
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
    status: string;
    tournament_round: TournamentRound;
    season: Season;
    tournament: Tournament2;
    competitors: Competitor[];
    venue: Venue;
}

export interface TournamentSchedulePayload {
    generated_at: Date;
    schema: string;
    tournament: Tournament;
    sport_events: SportEvent[];
}