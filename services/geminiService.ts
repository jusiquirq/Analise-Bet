
import { GoogleGenAI, Type } from "@google/genai";
import { Match, AIAnalysis } from "../types";
import { calculateCornerStats } from "./statsEngine";

// Initialize Gemini API
// CRITICAL: Assuming process.env.API_KEY is available as per instructions.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeMatch = async (match: Match): Promise<AIAnalysis> => {
  try {
    // 1. Run Deterministic Stats Engine First
    const realStats = calculateCornerStats(match);

    // 2. Feed real stats into AI Prompt
    const prompt = `
      Você é um especialista em análise de apostas esportivas (Bet Analyzer).
      
      DADOS REAIS CALCULADOS (Use estes números como base para sua análise):
      Análise de Escanteios (Algoritmo Matemático):
      - Time Casa (${match.homeTeam.name}) Média Escanteios Marcados em Casa: ${realStats.homeAvgCorners}
      - Time Casa Média Cedidos em Casa: ${realStats.homeConcededAvg}
      - Time Visitante (${match.awayTeam.name}) Média Escanteios Marcados Fora: ${realStats.awayAvgCorners}
      - Time Visitante Média Cedidos Fora: ${realStats.awayConcededAvg}
      - Total Esperado (Matemático): ${realStats.totalExpectedCorners}
      - Linha Sugerida: ${realStats.suggestion} ${realStats.likelyLine}
      
      DADOS DO JOGO:
      Time da Casa: ${match.homeTeam.name}
        - Forma Recente (Geral): ${match.homeTeam.recentForm.join('-')}
        - Posição: ${match.homeTeam.leaguePosition}
        - Odds Vitória: ${match.odds.homeWin}
        
      Time Visitante: ${match.awayTeam.name}
        - Forma Recente (Geral): ${match.awayTeam.recentForm.join('-')}
        - Posição: ${match.awayTeam.leaguePosition}
        - Odds Vitória: ${match.odds.awayWin}
        
      Odds Empate: ${match.odds.draw}
      Liga: ${match.league}

      INSTRUÇÃO:
      Use os dados calculados acima para justificar sua previsão de escanteios no campo 'predictedStats'.
      Se o algoritmo diz ${realStats.totalExpectedCorners} escanteios, sua previsão deve ser próxima disso.
      Defina uma 'recommendedStake' de 1 a 5 unidades, onde 1 é conservador e 5 é agressivo/valor alto, baseada na confiança e risco.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            prediction: { type: Type.STRING, description: "Uma frase resumindo a previsão do resultado." },
            confidenceScore: { type: Type.NUMBER, description: "Número inteiro de 0 a 100 indicando a confiança na previsão." },
            riskLevel: { type: Type.STRING, enum: ["Baixo", "Médio", "Alto"] },
            suggestedBet: { type: Type.STRING, description: "O mercado de aposta específico sugerido (ex: Real Madrid vence, Mais de 9.5 escanteios)." },
            recommendedStake: { type: Type.INTEGER, description: "Recomendação de unidades para apostar (1 a 5)." },
            keyFactors: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Lista de 3 fatores chave para a análise."
            },
            scorePrediction: { type: Type.STRING, description: "Placar exato previsto (ex: 2-1)." },
            predictedStats: {
              type: Type.OBJECT,
              description: "Estatísticas previstas para o jogo.",
              properties: {
                goals: {
                  type: Type.OBJECT,
                  properties: { home: { type: Type.NUMBER }, away: { type: Type.NUMBER } },
                  required: ["home", "away"]
                },
                shotsOnTarget: {
                  type: Type.OBJECT,
                  description: "Número estimado de finalizações no gol (chutes certos).",
                  properties: { home: { type: Type.NUMBER }, away: { type: Type.NUMBER } },
                  required: ["home", "away"]
                },
                corners: {
                  type: Type.OBJECT,
                  description: "Número estimado de escanteios. DEVE ser consistente com os dados calculados.",
                  properties: { home: { type: Type.NUMBER }, away: { type: Type.NUMBER } },
                  required: ["home", "away"]
                },
                yellowCards: {
                  type: Type.OBJECT,
                  description: "Número estimado de cartões amarelos.",
                  properties: { home: { type: Type.NUMBER }, away: { type: Type.NUMBER } },
                  required: ["home", "away"]
                },
                fouls: {
                  type: Type.OBJECT,
                  description: "Número estimado de faltas cometidas.",
                  properties: { home: { type: Type.NUMBER }, away: { type: Type.NUMBER } },
                  required: ["home", "away"]
                },
                redCardProb: { type: Type.NUMBER, description: "Probabilidade percentual (0-100) de haver cartão vermelho no jogo." },
                penaltyProb: { type: Type.NUMBER, description: "Probabilidade percentual (0-100) de haver pênalti no jogo." }
              },
              required: ["goals", "shotsOnTarget", "corners", "yellowCards", "fouls", "redCardProb", "penaltyProb"]
            }
          },
          required: ["prediction", "confidenceScore", "riskLevel", "suggestedBet", "recommendedStake", "keyFactors", "scorePrediction", "predictedStats"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as AIAnalysis;
    }
    
    throw new Error("Resposta vazia da IA");

  } catch (error) {
    console.error("Erro ao analisar jogo com Gemini:", error);
    return {
      prediction: "Não foi possível gerar a análise IA no momento.",
      confidenceScore: 0,
      riskLevel: "Médio",
      suggestedBet: "N/A",
      recommendedStake: 1,
      keyFactors: ["Erro de conexão", "Tente novamente"],
      scorePrediction: "?-?",
      predictedStats: {
        goals: { home: 0, away: 0 },
        shotsOnTarget: { home: 0, away: 0 },
        corners: { home: 0, away: 0 },
        yellowCards: { home: 0, away: 0 },
        fouls: { home: 0, away: 0 },
        redCardProb: 0,
        penaltyProb: 0
      }
    };
  }
};

// New function for Chat/Follow-up questions
export const askMatchAssistant = async (match: Match, question: string, previousAnalysis: AIAnalysis | null): Promise<string> => {
  try {
    const realStats = calculateCornerStats(match);
    
    const context = `
      Jogo: ${match.homeTeam.name} vs ${match.awayTeam.name}.
      Dados Matemáticos de Escanteios: Total Esperado ${realStats.totalExpectedCorners}, Linha ${realStats.likelyLine}.
      Previsão Anterior da IA: ${previousAnalysis?.prediction || 'N/A'}.
      Aposta Sugerida: ${previousAnalysis?.suggestedBet || 'N/A'}.
      Pergunta do Usuário: "${question}"
    `;

    const prompt = `
      ${context}
      
      Responda à pergunta do usuário de forma direta, curta e técnica (máximo 3 frases).
      Você é um especialista em apostas. Se a pergunta for irrelevante ao jogo, diga que só analisa este jogo.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Não consegui processar sua pergunta.";
  } catch (error) {
    console.error("Erro no chat:", error);
    return "Erro ao conectar com o assistente.";
  }
}
