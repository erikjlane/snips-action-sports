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

interface Schedule {
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

export interface TeamSchedulePayload {
    generated_at: Date;
    schema: string;
    team: Team;
    schedule: Schedule[];
}