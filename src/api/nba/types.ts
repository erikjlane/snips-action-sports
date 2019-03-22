export interface League {
    id:         string;
    name:       string;
    alias:      string;
    divisions?: League[];
    teams?:     Team[];
}

export interface Team {
    id:        string;
    name:      string;
    market:    string;
    sr_id:     string;
    reference: string;
    rank:      Rank;
}

export interface Rank {
    conference: number;
    division:   number;
    clinched?:  string;
}

export interface Season {
    id:   string;
    year: number;
    type: string;
}

export interface Game {
    id:               string;
    status:           string;
    coverage:         string;
    scheduled:        string;
    home_points?:     number;
    away_points?:     number;
    track_on_court:   boolean;
    sr_id?:           string;
    reference:        string;
    time_zones:       TimeZones;
    venue:            Venue;
    broadcasts:       Broadcast[];
    home:             Away;
    away:             Away;
    conference_game?: boolean;
    title?:           string;
    neutral_site?:    boolean;
}

export interface Away {
    name:      string;
    alias:     string;
    id:        string;
    sr_id?:    string;
    reference: string;
}

export interface Broadcast {
    network:  string;
    type:     string;
    locale?:  string;
    channel?: string;
}

export interface TimeZones {
    venue?: string;
    home?:  string;
    away?:  string;
}

export interface Venue {
    id:       string;
    name:     string;
    capacity: number;
    address:  string;
    city:     string;
    state?:   string;
    zip?:     string;
    country:  string;
    sr_id?:   string;
}

export interface RankingsPayload {
    league:      League;
    season:      Season;
    conferences: League[];
}

export interface SchedulePayload {
    league: League;
    season: Season;
    games:  Game[];
}
