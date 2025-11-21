
import { Match, StatsEngineResult, GoalProbabilities } from "../types";

// Helper to calculate average of an array
const getAvg = (arr: number[]) => {
  if (!arr || arr.length === 0) return 0;
  const sum = arr.reduce((a, b) => a + b, 0);
  return parseFloat((sum / arr.length).toFixed(1));
};

export const calculateCornerStats = (match: Match): StatsEngineResult => {
  // 1. Coleta de Dados e Médias
  const homeAvgFor = getAvg(match.homeTeam.cornersStats.home.scored);
  const homeAvgAgainst = getAvg(match.homeTeam.cornersStats.home.conceded);
  const awayAvgFor = getAvg(match.awayTeam.cornersStats.away.scored);
  const awayAvgAgainst = getAvg(match.awayTeam.cornersStats.away.conceded);

  // 2. Algoritmo de Previsão
  const homeExpected = (homeAvgFor + awayAvgAgainst) / 2;
  const awayExpected = (awayAvgFor + homeAvgAgainst) / 2;
  const totalExpected = parseFloat((homeExpected + awayExpected).toFixed(1));

  // 3. Insights e Linhas
  const insights: string[] = [];
  let likelyLine = Math.round(totalExpected) - 0.5; 
  if (likelyLine < 8.5) likelyLine = 8.5;
  
  const suggestion: 'OVER' | 'UNDER' = totalExpected > likelyLine ? 'OVER' : 'UNDER';

  if (homeAvgFor > 7) insights.push(`${match.homeTeam.shortName} tem ataque forte em escanteios em casa (Média ${homeAvgFor})`);
  if (awayAvgAgainst > 6) insights.push(`${match.awayTeam.shortName} cede muitos escanteios jogando fora (Média ${awayAvgAgainst})`);
  if (totalExpected > 10.5) insights.push("Alta probabilidade de jogo com +10 escanteios");
  if (totalExpected < 8.5) insights.push("Jogo com tendência a poucos escanteios (Under)");

  return {
    homeAvgCorners: homeAvgFor,
    awayAvgCorners: awayAvgFor,
    homeConcededAvg: homeAvgAgainst,
    awayConcededAvg: awayAvgAgainst,
    totalExpectedCorners: totalExpected,
    likelyLine: likelyLine,
    suggestion: suggestion,
    insights: insights
  };
};

export const calculateGoalProbabilities = (match: Match): GoalProbabilities => {
  const hStats = match.homeTeam.advancedStats;
  const aStats = match.awayTeam.advancedStats;

  // Expected Goals: (Home Attack + Away Defense) / 2 + (Away Attack + Home Defense) / 2
  const homeExpectancy = (hStats.goalsScored.home + aStats.goalsConceded.away) / 2;
  const awayExpectancy = (aStats.goalsScored.away + hStats.goalsConceded.home) / 2;
  const totalExpectancy = homeExpectancy + awayExpectancy;

  // BTTS Probability: Average of both teams' BTTS % combined with expected goals > 0.8 for both
  const bttsBase = (hStats.bttsPercentage + aStats.bttsPercentage) / 2;
  const bothLikelyToScore = homeExpectancy > 0.9 && awayExpectancy > 0.9 ? 10 : -10;
  const bttsProb = Math.min(95, Math.max(5, Math.round(bttsBase + bothLikelyToScore)));

  // Poisson-like estimation (simplified linear mapping for demo) for Over/Under
  // A total expectancy of 2.5 usually means ~50% chance of Over 2.5.
  // If total > 3.0, high chance.
  const over25Base = (hStats.over25Percentage + aStats.over25Percentage) / 2;
  const over25Adjustment = (totalExpectancy - 2.5) * 20; // Adjust +/- based on expectancy
  const over25Prob = Math.min(95, Math.max(5, Math.round(over25Base + over25Adjustment)));

  return {
    avgGoalsMatch: parseFloat(totalExpectancy.toFixed(2)),
    homeGoalExpectancy: parseFloat(homeExpectancy.toFixed(2)),
    awayGoalExpectancy: parseFloat(awayExpectancy.toFixed(2)),
    bttsProb: bttsProb,
    over05Prob: 95, // Almost always high
    over15Prob: Math.min(90, over25Prob + 20),
    over25Prob: over25Prob
  };
};
