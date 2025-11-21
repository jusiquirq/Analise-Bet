
import { Match, Notification, Team } from './types';

// Helper to create dates
const today = new Date();
const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
const futureDate1 = new Date(today); futureDate1.setDate(today.getDate() + 5);
const futureDate2 = new Date(today); futureDate2.setDate(today.getDate() + 12);

// Helper to format date as "DD Mmm" (e.g. 22 Out) dynamically
const formatDate = (date: Date) => {
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  return `${date.getDate()} ${months[date.getMonth()]}`;
};

export const COUNTRIES = [
  { name: 'Espanha', flag: '🇪🇸' },
  { name: 'Inglaterra', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  { name: 'Alemanha', flag: '🇩🇪' },
  { name: 'Brasil', flag: '🇧🇷' },
];

// Helper to build stats easily
const buildStats = (id: string, name: string, short: string, pos: number) => ({
  id, name, shortName: short, logo: `https://ui-avatars.com/api/?name=${short}&background=random`,
  recentForm: ['V', 'V', 'E', 'V', 'D'],
  last10Home: ['V', 'V', 'V', 'E', 'V', 'V', 'V', 'D', 'V', 'V'],
  leaguePosition: pos,
  stats: { attack: 85 + Math.random() * 10, defense: 80 + Math.random() * 10, midfield: 85 },
  cornersStats: {
    home: { scored: [7,8,6,9,7], conceded: [3,2,4,2,3] },
    away: { scored: [5,6,4,5,7], conceded: [4,5,3,6,4] }
  },
  advancedStats: {
    goalsScored: { total: 2.1, home: 2.4, away: 1.8 },
    goalsConceded: { total: 0.9, home: 0.6, away: 1.2 },
    bttsPercentage: 60,
    over25Percentage: 70,
    matchesPlayed: 10
  }
});

const TEAMS_DATA = {
  realMadrid: { ...buildStats('t1', 'Real Madrid', 'RMA', 2), advancedStats: { goalsScored: { total: 2.5, home: 2.8, away: 2.2 }, goalsConceded: { total: 0.8, home: 0.5, away: 1.1 }, bttsPercentage: 50, over25Percentage: 80, matchesPlayed: 10 } },
  barcelona: { ...buildStats('t2', 'Barcelona', 'BAR', 1), advancedStats: { goalsScored: { total: 2.7, home: 3.0, away: 2.4 }, goalsConceded: { total: 1.0, home: 0.8, away: 1.2 }, bttsPercentage: 60, over25Percentage: 90, matchesPlayed: 10 } },
  manCity: { ...buildStats('t3', 'Man City', 'MCI', 2), advancedStats: { goalsScored: { total: 2.4, home: 2.6, away: 2.2 }, goalsConceded: { total: 0.9, home: 0.7, away: 1.1 }, bttsPercentage: 55, over25Percentage: 75, matchesPlayed: 10 } },
  liverpool: { ...buildStats('t4', 'Liverpool', 'LIV', 1), advancedStats: { goalsScored: { total: 2.3, home: 2.5, away: 2.1 }, goalsConceded: { total: 0.8, home: 0.6, away: 1.0 }, bttsPercentage: 50, over25Percentage: 70, matchesPlayed: 10 } },
  bayern: { ...buildStats('t5', 'Bayern Munich', 'BAY', 1), advancedStats: { goalsScored: { total: 2.8, home: 3.2, away: 2.4 }, goalsConceded: { total: 1.1, home: 0.9, away: 1.3 }, bttsPercentage: 70, over25Percentage: 90, matchesPlayed: 10 } },
  dortmund: { ...buildStats('t6', 'Dortmund', 'BVB', 4), advancedStats: { goalsScored: { total: 1.9, home: 2.2, away: 1.6 }, goalsConceded: { total: 1.4, home: 1.1, away: 1.7 }, bttsPercentage: 80, over25Percentage: 80, matchesPlayed: 10 } },
  flamengo: { ...buildStats('t7', 'Flamengo', 'FLA', 3), advancedStats: { goalsScored: { total: 1.8, home: 2.0, away: 1.6 }, goalsConceded: { total: 1.0, home: 0.8, away: 1.2 }, bttsPercentage: 40, over25Percentage: 50, matchesPlayed: 10 } },
  palmeiras: { ...buildStats('t8', 'Palmeiras', 'PAL', 2), advancedStats: { goalsScored: { total: 1.7, home: 1.9, away: 1.5 }, goalsConceded: { total: 0.7, home: 0.5, away: 0.9 }, bttsPercentage: 30, over25Percentage: 40, matchesPlayed: 10 } },
};

export const TEAMS = TEAMS_DATA;

export const MOCK_MATCHES: Match[] = [
  {
    id: 'm1',
    country: 'Espanha',
    league: 'La Liga',
    date: 'Hoje',
    timestamp: today.getTime(),
    time: '16:00',
    homeTeam: TEAMS.realMadrid,
    awayTeam: TEAMS.barcelona,
    odds: { homeWin: 2.45, draw: 3.60, awayWin: 2.80, provider: 'Bet365', trend: { home: 'down', draw: 'stable', away: 'up' } },
    status: 'Scheduled'
  },
  {
    id: 'm2',
    country: 'Inglaterra',
    league: 'Premier League',
    date: 'Hoje',
    timestamp: today.getTime(),
    time: 'AO VIVO',
    homeTeam: TEAMS.manCity,
    awayTeam: TEAMS.liverpool,
    odds: { homeWin: 1.95, draw: 3.80, awayWin: 3.50, provider: 'BetFair', trend: { home: 'stable', draw: 'up', away: 'down' } },
    status: 'Live',
    score: { home: 1, away: 1 }
  },
  {
    id: 'm3',
    country: 'Alemanha',
    league: 'Bundesliga',
    date: 'Amanhã',
    timestamp: tomorrow.getTime(),
    time: '14:45',
    homeTeam: TEAMS.bayern,
    awayTeam: TEAMS.dortmund,
    odds: { homeWin: 1.55, draw: 4.20, awayWin: 5.50, provider: '1xBet', trend: { home: 'down', draw: 'up', away: 'up' } },
    status: 'Scheduled'
  },
  // Future Matches - Dynamic Dates
  {
    id: 'm4',
    country: 'Espanha',
    league: 'La Liga',
    date: formatDate(futureDate1),
    timestamp: futureDate1.getTime(),
    time: '17:00',
    homeTeam: TEAMS.barcelona,
    awayTeam: TEAMS.realMadrid,
    odds: { homeWin: 2.10, draw: 3.40, awayWin: 3.10, provider: 'Bet365' },
    status: 'Scheduled'
  },
  {
    id: 'm5',
    country: 'Brasil',
    league: 'Brasileirão',
    date: formatDate(futureDate2),
    timestamp: futureDate2.getTime(),
    time: '21:30',
    homeTeam: TEAMS.flamengo,
    awayTeam: TEAMS.palmeiras,
    odds: { homeWin: 2.30, draw: 3.10, awayWin: 3.00, provider: 'Betano' },
    status: 'Scheduled'
  }
];

export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 'n1',
    type: 'odds_change',
    message: 'Odds para Real Madrid subiram para 2.50!',
    time: '10 min atrás',
    read: false
  },
  {
    id: 'n2',
    type: 'match_start',
    message: 'Man City vs Liverpool começou.',
    time: '35 min atrás',
    read: true
  },
  {
    id: 'n3',
    type: 'goal',
    message: 'GOL! Man City 1 - 0 Liverpool',
    time: '20 min atrás',
    read: true
  }
];
