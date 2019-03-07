interface Sport {
    id: string;
    name: string;
}

interface Category {
    id: string;
    name: string;
}

interface CurrentSeason {
    id: string;
    name: string;
    start_date: string;
    end_date: string;
    year: string;
}

interface Tournament {
    id: string;
    name: string;
    sport: Sport;
    category: Category;
    current_season: CurrentSeason;
}

interface Season {
    id: string;
    name: string;
    start_date: string;
    end_date: string;
    year: string;
    tournament_id: string;
}

interface Team {
    id: string;
    name: string;
}

interface TeamStanding {
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

interface Group {
    name: string;
    id: string;
    team_standings: TeamStanding[];
}

interface Standing {
    tie_break_rule: string;
    type: string;
    groups: Group[];
}

export interface TournamentStandingsPayload {
    generated_at: Date;
    schema: string;
    tournament: Tournament;
    season: Season;
    standings: Standing[];
}