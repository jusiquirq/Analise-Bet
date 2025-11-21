
export interface Team {
  id: string;
  name: string;
  shortName: string;
  logo: string; // URL or emoji for demo
  recentForm: string[]; // e.g., ['W', 'L', 'D', 'W', 'W']
  last10Home: string[]; // Last 10 games played at home
  leaguePosition: number;
  stats: {
    attack: number;
    defense: number;
    midfield: number;
  };
  // New detailed stats for deterministic calculation
  cornersStats: {
    home: {
      scored: number[]; // Last 5-10 games at home
      conceded: number[]; // Last 5-10 games at home
    };
    away: {
      scored: number[]; // Last 5-10 games away
      conceded: number[]; // Last 5-10 games away
    };
  };
  // New Advanced Goal Stats for "Future Games" analysis
  advancedStats: {
    goalsScored: { total: number; home: number; away: number }; // Avg per game
    goalsConceded: { total: number; home: number; away: number }; // Avg per game
    bttsPercentage: number; // % of games where both teams scored (last 10)
    over25Percentage: number; // % of games over 2.5 goals (last 10)
    matchesPlayed: number;
  };
}

export interface Odds {
  homeWin: number;
  draw: number;
  awayWin: number;
  provider: string;
  trend?: {
    home: 'up' | 'down' | 'stable';
    draw: 'up' | 'down' | 'stable';
    away: 'up' | 'down' | 'stable';
  };
}

export interface Match {
  id: string;
  country: string; // New field for navigation
  league: string;
  date: string;
  timestamp: number; // Unix timestamp for filtering future matches
  time: string;
  homeTeam: Team;
  awayTeam: Team;
  odds: Odds;
  status: 'Scheduled' | 'Live' | 'Finished';
  score?: {
    home: number;
    away: number;
  };
}

export interface Notification {
  id: string;
  type: 'odds_change' | 'match_start' | 'goal';
  message: string;
  time: string;
  read: boolean;
}

export interface PredictedStats {
  goals: { home: number; away: number };
  shotsOnTarget: { home: number; away: number };
  corners: { home: number; away: number };
  yellowCards: { home: number; away: number };
  fouls: { home: number; away: number };
  redCardProb: number; // Percentage 0-100
  penaltyProb: number; // Percentage 0-100
}

export interface AIAnalysis {
  prediction: string;
  confidenceScore: number; // 0-100
  riskLevel: 'Baixo' | 'Médio' | 'Alto';
  suggestedBet: string;
  recommendedStake: number; // 1 to 5 units (1 = conservative, 5 = aggressive)
  keyFactors: string[];
  scorePrediction: string;
  predictedStats: PredictedStats;
}

// Result from the deterministic engine
export interface StatsEngineResult {
  homeAvgCorners: number; // Based on Home Team playing at Home
  awayAvgCorners: number; // Based on Away Team playing Away
  homeConcededAvg: number;
  awayConcededAvg: number;
  totalExpectedCorners: number;
  likelyLine: number; // e.g., 9.5
  suggestion: 'OVER' | 'UNDER';
  insights: string[]; // e.g. "Home team concedes many corners"
}

export interface GoalProbabilities {
  avgGoalsMatch: number;
  bttsProb: number;
  over05Prob: number;
  over15Prob: number;
  over25Prob: number;
  homeGoalExpectancy: number;
  awayGoalExpectancy: number;
}
