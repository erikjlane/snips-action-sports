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

export interface RankingsPayload {
    league:      League;
    season:      Season;
    conferences: League[];
}
