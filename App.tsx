
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Calendar, 
  ArrowLeft, 
  Brain, 
  TrendingUp, 
  AlertTriangle, 
  ShieldCheck, 
  Activity,
  Trophy,
  Search,
  Bell,
  X,
  Zap,
  Flag,
  Square,
  Gavel,
  Footprints,
  Target,
  Calculator,
  BarChart3,
  TrendingDown,
  Minus,
  Coins,
  MessageSquare,
  Send,
  ChevronRight,
  ListFilter,
  Globe,
  MapPin
} from 'lucide-react';
import { MOCK_MATCHES, MOCK_NOTIFICATIONS, COUNTRIES } from './constants';
import { Match, AIAnalysis, Notification } from './types';
import { analyzeMatch, askMatchAssistant } from './services/geminiService';
import { calculateCornerStats, calculateGoalProbabilities } from './services/statsEngine';
import AnalysisChart from './components/AnalysisChart';

// --- Sub-components ---

const OddsTrendArrow: React.FC<{ trend?: 'up' | 'down' | 'stable' }> = ({ trend }) => {
  if (!trend || trend === 'stable') return <Minus className="w-3 h-3 text-slate-600 inline ml-1" />;
  if (trend === 'up') return <TrendingUp className="w-3 h-3 text-red-500 inline ml-1" />; 
  if (trend === 'down') return <TrendingDown className="w-3 h-3 text-emerald-500 inline ml-1" />; 
  return null;
};

const OddBox: React.FC<{ label: string; value: number; trend?: 'up' | 'down' | 'stable'; baseTextColor: string }> = ({ label, value, trend, baseTextColor }) => {
  const isUp = trend === 'up';
  const isDown = trend === 'down';

  let containerClass = "text-center w-1/3 p-2 rounded-lg transition-all duration-500";
  let valueClass = "font-bold flex items-center justify-center gap-1 transition-colors duration-300";
  
  if (isUp) {
    containerClass += " bg-red-500/10 border border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.1)]";
    valueClass += " text-red-400 animate-pulse";
  } else if (isDown) {
    containerClass += " bg-emerald-500/10 border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]";
    valueClass += " text-emerald-400 animate-pulse";
  } else {
    containerClass += " hover:bg-slate-800/50 border border-transparent";
    valueClass += ` ${baseTextColor}`;
  }

  return (
    <div className={containerClass}>
      <div className="text-slate-500 mb-1 text-[10px] uppercase">{label}</div>
      <div className={valueClass}>
        {value.toFixed(2)}
        <OddsTrendArrow trend={trend} />
      </div>
    </div>
  );
};

interface MatchListProps {
  matches: Match[];
  onSelectMatch: (match: Match) => void;
  emptyMessage?: string;
  headerContent?: React.ReactNode;
}

const MatchList: React.FC<MatchListProps> = ({ matches, onSelectMatch, emptyMessage = "Nenhum jogo encontrado.", headerContent }) => (
  <div className="flex-1 overflow-y-auto no-scrollbar pb-20">
    <div className="px-4 pt-4 pb-2">
      {headerContent}
      
      {matches.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-slate-500">
          <Activity className="w-12 h-12 mb-2 opacity-20" />
          <p>{emptyMessage}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {matches.map((match) => (
            <div 
              key={match.id}
              onClick={() => onSelectMatch(match)}
              className="glass-panel rounded-xl p-4 active:scale-[0.98] transition-all cursor-pointer hover:bg-slate-800/50 border border-slate-800/50 hover:border-emerald-500/30 relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/5 to-emerald-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              
              <div className="flex justify-between items-center text-xs text-slate-400 mb-3">
                <span className="flex items-center gap-1">
                  <Globe className="w-3 h-3" /> {match.country} <ChevronRight className="w-3 h-3" /> {match.league}
                </span>
                <span className="flex items-center gap-1">
                  {match.status === 'Live' ? (
                    <span className="flex items-center gap-1 text-red-500 font-bold animate-pulse">
                      <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                      AO VIVO • {match.time}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {match.date} • {match.time}
                    </span>
                  )}
                </span>
              </div>

              <div className="flex justify-between items-center mb-4">
                <div className="flex flex-col items-center w-1/3">
                  <img src={match.homeTeam.logo} alt={match.homeTeam.name} className="w-10 h-10 rounded-full mb-2 bg-slate-700 object-cover" />
                  <span className="text-sm font-medium text-center leading-tight">{match.homeTeam.shortName}</span>
                </div>
                
                <div className="flex flex-col items-center justify-center w-1/3">
                  {match.status === 'Live' && match.score ? (
                     <div className="text-2xl font-bold text-white bg-slate-800/80 px-3 py-1 rounded-lg border border-slate-700 whitespace-nowrap">
                       {match.score.home} - {match.score.away}
                     </div>
                  ) : (
                    <span className="text-2xl font-bold text-slate-700">VS</span>
                  )}
                </div>

                <div className="flex flex-col items-center w-1/3">
                  <img src={match.awayTeam.logo} alt={match.awayTeam.name} className="w-10 h-10 rounded-full mb-2 bg-slate-700 object-cover" />
                  <span className="text-sm font-medium text-center leading-tight">{match.awayTeam.shortName}</span>
                </div>
              </div>

              <div className="flex justify-between items-center bg-slate-950/50 rounded-lg p-1 text-xs gap-1">
                <OddBox label="1" value={match.odds.homeWin} trend={match.odds.trend?.home} baseTextColor="text-emerald-400" />
                <div className="w-px h-8 bg-slate-800/50"></div>
                <OddBox label="X" value={match.odds.draw} trend={match.odds.trend?.draw} baseTextColor="text-white" />
                <div className="w-px h-8 bg-slate-800/50"></div>
                <OddBox label="2" value={match.odds.awayWin} trend={match.odds.trend?.away} baseTextColor="text-blue-400" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
);

interface NotificationsListProps {
  notifications: Notification[];
}

const NotificationsList: React.FC<NotificationsListProps> = ({ notifications }) => (
  <div className="flex-1 overflow-y-auto no-scrollbar pb-20">
    <div className="px-4 pt-4">
      <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <Bell className="w-5 h-5 text-emerald-400" />
        Notificações
      </h2>
      <div className="space-y-3">
        {notifications.map(notification => (
          <div key={notification.id} className={`glass-panel p-4 rounded-xl border-l-4 ${notification.read ? 'border-l-slate-600 opacity-70' : 'border-l-emerald-500'}`}>
            <div className="flex justify-between items-start mb-1">
              <span className="text-xs font-bold text-emerald-400 uppercase">{notification.type.replace('_', ' ')}</span>
              <span className="text-xs text-slate-400">{notification.time}</span>
            </div>
            <p className="text-sm text-slate-200">{notification.message}</p>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// --- New Browsing Components ---

interface CountryListProps {
  onSelectCountry: (country: string) => void;
}

const CountryList: React.FC<CountryListProps> = ({ onSelectCountry }) => (
  <div className="flex-1 overflow-y-auto no-scrollbar pb-20">
    <div className="px-4 pt-4">
      <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <Globe className="w-5 h-5 text-cyan-400" />
        Selecione um País
      </h2>
      <div className="grid grid-cols-1 gap-3">
        {COUNTRIES.map((c) => (
          <button
            key={c.name}
            onClick={() => onSelectCountry(c.name)}
            className="glass-panel p-4 rounded-xl flex items-center justify-between hover:bg-slate-800 transition-all active:scale-[0.98] group"
          >
            <div className="flex items-center gap-4">
              <span className="text-2xl">{c.flag}</span>
              <span className="font-semibold text-lg text-slate-200">{c.name}</span>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-white" />
          </button>
        ))}
      </div>
    </div>
  </div>
);

interface LeagueListProps {
  country: string;
  leagues: string[];
  onSelectLeague: (league: string) => void;
  onBack: () => void;
}

const LeagueList: React.FC<LeagueListProps> = ({ country, leagues, onSelectLeague, onBack }) => (
  <div className="flex-1 overflow-y-auto no-scrollbar pb-20">
    <div className="px-4 pt-4">
      <div className="flex items-center gap-2 mb-4">
        <button onClick={onBack} className="p-1 rounded-full hover:bg-slate-800">
           <ArrowLeft className="w-5 h-5 text-slate-400" />
        </button>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
           Ligas em {country}
        </h2>
      </div>
      <div className="grid grid-cols-1 gap-3">
        {leagues.map((league) => (
          <button
            key={league}
            onClick={() => onSelectLeague(league)}
            className="glass-panel p-4 rounded-xl flex items-center justify-between hover:bg-slate-800 transition-all active:scale-[0.98] border-l-4 border-l-transparent hover:border-l-yellow-400 group"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-yellow-500">
                <Trophy className="w-5 h-5" />
              </div>
              <span className="font-semibold text-lg text-slate-200">{league}</span>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-white" />
          </button>
        ))}
      </div>
    </div>
  </div>
);

interface StatRowProps {
  icon: React.ReactNode;
  label: string;
  homeValue: number;
  awayValue: number;
  colorClass?: string;
}

const StatRow: React.FC<StatRowProps> = ({ icon, label, homeValue, awayValue, colorClass = "bg-slate-600" }) => {
  const total = homeValue + awayValue || 1;
  const homePercent = (homeValue / total) * 100;
  
  return (
    <div className="mb-3">
      <div className="flex justify-between items-center text-xs text-slate-400 mb-1">
        <span className="font-bold text-slate-200">{homeValue}</span>
        <div className="flex items-center gap-1">
          {icon}
          <span>{label}</span>
        </div>
        <span className="font-bold text-slate-200">{awayValue}</span>
      </div>
      <div className="flex h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
        <div 
          className={`h-full ${colorClass} transition-all duration-1000`} 
          style={{ width: `${homePercent}%` }}
        />
      </div>
    </div>
  );
};

interface FormDotsProps {
  form: string[];
  label: string;
  align?: 'left' | 'right';
}

const FormDots: React.FC<FormDotsProps> = ({ form, label, align = 'left' }) => (
  <div className={`flex flex-col ${align === 'right' ? 'items-end' : 'items-start'} gap-1`}>
    <span className="text-[10px] text-slate-500 uppercase">{label}</span>
    <div className="flex gap-1">
      {form.map((result, i) => {
        let color = "bg-slate-600";
        if (result === 'V') color = "bg-emerald-500";
        if (result === 'D') color = "bg-red-500";
        return (
          <div key={i} className={`w-2 h-2 rounded-full ${color}`} title={result} />
        );
      })}
    </div>
  </div>
);

// New Advanced Goal Stats Card
const GoalStatsCard: React.FC<{ match: Match }> = ({ match }) => {
  const probs = useMemo(() => calculateGoalProbabilities(match), [match]);
  
  return (
    <div className="glass-panel rounded-xl p-5 border border-slate-800 mb-6">
      <div className="flex items-center gap-2 mb-4 text-pink-400">
        <Target className="w-4 h-4" />
        <h3 className="font-bold text-sm uppercase">Análise de Gols & Probabilidades</h3>
      </div>

      {/* Main Probabilities */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-slate-900/50 p-2 rounded-lg text-center border border-slate-800">
            <div className="text-[10px] text-slate-400 mb-1">BTTS (Ambas)</div>
            <div className={`text-lg font-bold ${probs.bttsProb > 60 ? 'text-emerald-400' : 'text-slate-300'}`}>{probs.bttsProb}%</div>
        </div>
        <div className="bg-slate-900/50 p-2 rounded-lg text-center border border-slate-800">
            <div className="text-[10px] text-slate-400 mb-1">Over 2.5</div>
            <div className={`text-lg font-bold ${probs.over25Prob > 60 ? 'text-emerald-400' : 'text-slate-300'}`}>{probs.over25Prob}%</div>
        </div>
        <div className="bg-slate-900/50 p-2 rounded-lg text-center border border-slate-800">
            <div className="text-[10px] text-slate-400 mb-1">Exp. Gols</div>
            <div className="text-lg font-bold text-white">{probs.avgGoalsMatch}</div>
        </div>
      </div>

      {/* Detailed Averages */}
      <div className="space-y-4 text-xs">
         <div className="grid grid-cols-3 gap-2 items-center text-center border-b border-slate-800 pb-2">
            <span className="font-bold text-slate-200">{match.homeTeam.shortName}</span>
            <span className="text-slate-500">MÉDIA GOLS</span>
            <span className="font-bold text-slate-200">{match.awayTeam.shortName}</span>
         </div>

         {/* Scored Total */}
         <div className="flex justify-between items-center">
            <span className="font-mono text-emerald-400">{match.homeTeam.advancedStats.goalsScored.total.toFixed(1)}</span>
            <span className="text-slate-500">Marcados (Total)</span>
            <span className="font-mono text-emerald-400">{match.awayTeam.advancedStats.goalsScored.total.toFixed(1)}</span>
         </div>
         {/* Scored Home/Away */}
         <div className="flex justify-between items-center">
            <span className="font-mono text-emerald-400">{match.homeTeam.advancedStats.goalsScored.home.toFixed(1)}</span>
            <span className="text-slate-500">Marcados (Casa / Fora)</span>
            <span className="font-mono text-emerald-400">{match.awayTeam.advancedStats.goalsScored.away.toFixed(1)}</span>
         </div>

         <div className="h-px bg-slate-800 w-full my-2"></div>

         {/* Conceded Total */}
         <div className="flex justify-between items-center">
            <span className="font-mono text-red-400">{match.homeTeam.advancedStats.goalsConceded.total.toFixed(1)}</span>
            <span className="text-slate-500">Sofridos (Total)</span>
            <span className="font-mono text-red-400">{match.awayTeam.advancedStats.goalsConceded.total.toFixed(1)}</span>
         </div>
          {/* Conceded Home/Away */}
          <div className="flex justify-between items-center">
            <span className="font-mono text-red-400">{match.homeTeam.advancedStats.goalsConceded.home.toFixed(1)}</span>
            <span className="text-slate-500">Sofridos (Casa / Fora)</span>
            <span className="font-mono text-red-400">{match.awayTeam.advancedStats.goalsConceded.away.toFixed(1)}</span>
         </div>
      </div>
    </div>
  );
}

const CornerStatsCard: React.FC<{ match: Match }> = ({ match }) => {
  const stats = useMemo(() => calculateCornerStats(match), [match]);

  return (
    <div className="glass-panel rounded-xl p-5 border border-slate-800 mb-6">
      <div className="flex items-center gap-2 mb-4 text-cyan-400">
        <Calculator className="w-4 h-4" />
        <h3 className="font-bold text-sm uppercase">Análise de Escanteios</h3>
      </div>

      <div className="flex justify-between items-center mb-4 bg-slate-900/50 p-3 rounded-lg border border-slate-800">
        <div className="text-center">
          <div className="text-xs text-slate-400 mb-1">Média Casa</div>
          <div className="text-xl font-bold text-white">{stats.homeAvgCorners}</div>
        </div>
        
        <div className="h-8 w-px bg-slate-700"></div>

        <div className="text-center">
          <div className="text-xs text-emerald-400 font-bold mb-1">ESPERADO</div>
          <div className="text-2xl font-bold text-white">{stats.totalExpectedCorners}</div>
          <div className="text-[10px] text-cyan-400 font-bold">{stats.suggestion} {stats.likelyLine}</div>
        </div>

        <div className="h-8 w-px bg-slate-700"></div>

        <div className="text-center">
          <div className="text-xs text-slate-400 mb-1">Média Fora</div>
          <div className="text-xl font-bold text-white">{stats.awayAvgCorners}</div>
        </div>
      </div>
      
      <div className="bg-slate-950/30 rounded-lg p-3 mt-3">
          <ul className="space-y-1.5">
            {stats.insights.map((insight, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                <BarChart3 className="w-3 h-3 text-cyan-500 shrink-0 mt-0.5" />
                {insight}
              </li>
            ))}
          </ul>
      </div>
    </div>
  );
};

const ChatAssistant: React.FC<{ match: Match, analysis: AIAnalysis | null }> = ({ match, analysis }) => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [asking, setAsking] = useState(false);

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;
    
    setAsking(true);
    setAnswer('');
    const result = await askMatchAssistant(match, question, analysis);
    setAnswer(result);
    setAsking(false);
  };

  return (
    <div className="glass-panel rounded-xl p-5 border border-slate-800 mt-6">
      <div className="flex items-center gap-2 mb-3 text-purple-400">
        <MessageSquare className="w-4 h-4" />
        <h3 className="font-bold text-sm uppercase">Tira-Dúvidas IA</h3>
      </div>
      
      <form onSubmit={handleAsk} className="flex gap-2 mb-4">
        <input 
          type="text" 
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ex: E se o time da casa marcar primeiro?"
          className="flex-1 bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-purple-500"
        />
        <button 
          type="submit" 
          disabled={asking || !question}
          className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white p-2 rounded-lg transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

      {asking && (
        <div className="flex items-center gap-2 text-xs text-slate-500 animate-pulse">
          <Brain className="w-3 h-3" />
          Consultando especialista...
        </div>
      )}

      {answer && (
        <div className="bg-slate-800/50 rounded-lg p-3 text-sm text-slate-200 border-l-2 border-purple-500 animate-in fade-in slide-in-from-top-2">
          {answer}
        </div>
      )}
    </div>
  );
};

interface MatchDetailProps {
  match: Match;
  analysis: AIAnalysis | null;
  loading: boolean;
  onBack: () => void;
  onAnalyze: () => void;
}

const MatchDetail: React.FC<MatchDetailProps> = ({ match, analysis, loading, onBack, onAnalyze }) => {
  const getRiskColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'baixo': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
      case 'médio': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case 'alto': return 'text-red-400 bg-red-400/10 border-red-400/20';
      default: return 'text-slate-400';
    }
  };

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar bg-slate-950 relative pb-safe">
      <div className="sticky top-0 z-20 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 p-4 flex items-center gap-4">
        <button 
          onClick={onBack}
          className="p-2 rounded-full hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="font-semibold text-lg">Análise do Jogo</h2>
      </div>

      <div className="p-4 space-y-6 pb-20">
        <div className="flex justify-between items-center px-2">
           <div className="flex flex-col items-center w-[30%]">
              <img src={match.homeTeam.logo} className="w-16 h-16 rounded-full bg-slate-800 mb-2 object-cover" alt={match.homeTeam.name} />
              <h3 className="font-bold text-lg text-center leading-tight">{match.homeTeam.shortName}</h3>
              <span className="text-xs text-slate-400">#{match.homeTeam.leaguePosition} na Liga</span>
           </div>
           
           <div className="flex flex-col items-center w-[40%] relative z-10">
             {match.status === 'Live' && match.score ? (
                <div className="flex flex-col items-center w-full">
                  <div className="relative bg-slate-900/90 border border-red-500/30 px-4 py-3 rounded-2xl shadow-[0_0_20px_rgba(220,38,38,0.2)] min-w-[140px] flex flex-col items-center">
                     <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm animate-pulse whitespace-nowrap">
                        <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                        AO VIVO
                     </div>
                     <span className="text-4xl font-black text-white tracking-widest font-mono drop-shadow-lg whitespace-nowrap">
                        {match.score.home} - {match.score.away}
                     </span>
                  </div>
                  <span className="text-xs text-red-400 font-medium mt-2 flex items-center gap-1">
                    <Activity className="w-3 h-3" />
                    {match.time}
                  </span>
                </div>
             ) : (
                <div className="flex flex-col items-center">
                  <span className="text-3xl font-bold text-slate-600">VS</span>
                  <div className="flex flex-col items-center mt-1">
                    <span className="text-xs text-emerald-500 font-medium bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 mb-1">
                        {match.date}
                    </span>
                    <span className="text-xs text-slate-500">{match.time}</span>
                  </div>
                </div>
             )}
           </div>

           <div className="flex flex-col items-center w-[30%]">
              <img src={match.awayTeam.logo} className="w-16 h-16 rounded-full bg-slate-800 mb-2 object-cover" alt={match.awayTeam.name} />
              <h3 className="font-bold text-lg text-center leading-tight">{match.awayTeam.shortName}</h3>
              <span className="text-xs text-slate-400">#{match.awayTeam.leaguePosition} na Liga</span>
           </div>
        </div>

        <div className="glass-panel rounded-xl p-4 border border-slate-800">
          <div className="flex justify-between items-center">
             <FormDots form={match.homeTeam.last10Home} label="Casa (Últimos 10)" />
             <FormDots form={match.awayTeam.recentForm} label="Visitante (Geral)" align="right" />
          </div>
        </div>

        <div>
          <AnalysisChart homeTeam={match.homeTeam} awayTeam={match.awayTeam} />
        </div>

        {/* NEW STATS CARDS */}
        <GoalStatsCard match={match} />
        <CornerStatsCard match={match} />

        {!analysis && (
          <div className="flex flex-col items-center gap-4 py-2">
            <button
              onClick={onAnalyze}
              disabled={loading}
              className="group relative w-full max-w-xs bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold py-4 px-6 rounded-xl shadow-lg shadow-emerald-900/20 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3 cursor-pointer z-10"
            >
              {loading ? (
                 <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Analisando...
                 </>
              ) : (
                 <>
                  <Brain className="w-5 h-5" />
                  Gerar Análise IA Completa
                 </>
              )}
            </button>
            <p className="text-xs text-slate-500 text-center max-w-xs">
              Nossa IA cruzará os dados estatísticos acima com notícias e fatores externos.
            </p>
          </div>
        )}

        {analysis && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="glass-panel rounded-xl p-5 border-emerald-500/30 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-3 opacity-10">
                <Brain className="w-24 h-24 text-emerald-400" />
              </div>
              
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-emerald-400 font-bold text-sm uppercase tracking-wider mb-1">Sugestão IA</h3>
                    <p className="text-2xl font-bold text-white leading-tight max-w-[200px]">{analysis.suggestedBet}</p>
                  </div>
                  <div className={`px-3 py-1 rounded-full border text-xs font-bold uppercase ${getRiskColor(analysis.riskLevel)}`}>
                    Risco {analysis.riskLevel}
                  </div>
                </div>

                <div className="mb-4 flex items-center gap-2 bg-slate-900/60 p-2 rounded-lg border border-slate-700/50 w-fit">
                  <Coins className="w-4 h-4 text-yellow-500" />
                  <span className="text-xs text-slate-300">Stake:</span>
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <div 
                        key={i} 
                        className={`w-1.5 h-4 rounded-sm ${i < analysis.recommendedStake ? 'bg-yellow-500' : 'bg-slate-700'}`} 
                      />
                    ))}
                  </div>
                  <span className="text-xs font-bold text-white ml-1">{analysis.recommendedStake}/5</span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-slate-900/50 rounded-lg p-3">
                    <span className="text-slate-400 text-xs block mb-1">Confiança</span>
                    <div className="flex items-end gap-1">
                      <span className="text-xl font-bold text-white">{analysis.confidenceScore}%</span>
                      <div className="h-1.5 w-full bg-slate-700 rounded-full mb-1.5 ml-2">
                        <div 
                          className="h-full bg-emerald-400 rounded-full" 
                          style={{ width: `${analysis.confidenceScore}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="bg-slate-900/50 rounded-lg p-3">
                    <span className="text-slate-400 text-xs block mb-1">Placar Previsto</span>
                    <span className="text-xl font-bold text-white">{analysis.scorePrediction}</span>
                  </div>
                </div>

                <p className="text-sm text-slate-300 italic border-l-2 border-slate-600 pl-3 my-4">
                  "{analysis.prediction}"
                </p>

                <div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Fatores Chave</h4>
                  <ul className="space-y-2">
                    {analysis.keyFactors.map((factor, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-slate-300">
                        <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        {factor}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="glass-panel rounded-xl p-5 border border-slate-800">
              <h3 className="text-slate-200 font-bold text-sm uppercase mb-4 flex items-center gap-2">
                 <Activity className="w-4 h-4 text-blue-400" />
                 Estatísticas Esperadas (IA)
              </h3>
              
              <div className="space-y-4">
                <StatRow icon={<Footprints className="w-3 h-3" />} label="Gols Esperados" homeValue={analysis.predictedStats.goals.home} awayValue={analysis.predictedStats.goals.away} colorClass="bg-emerald-500" />
                <StatRow icon={<Target className="w-3 h-3" />} label="Finalizações no Gol" homeValue={analysis.predictedStats.shotsOnTarget.home} awayValue={analysis.predictedStats.shotsOnTarget.away} colorClass="bg-cyan-500" />
                <StatRow icon={<Flag className="w-3 h-3" />} label="Escanteios" homeValue={analysis.predictedStats.corners.home} awayValue={analysis.predictedStats.corners.away} colorClass="bg-blue-500" />
                <StatRow icon={<Square className="w-3 h-3 fill-yellow-400 text-yellow-400" />} label="Cartões Amarelos" homeValue={analysis.predictedStats.yellowCards.home} awayValue={analysis.predictedStats.yellowCards.away} colorClass="bg-yellow-500" />
                <StatRow icon={<Gavel className="w-3 h-3" />} label="Faltas" homeValue={analysis.predictedStats.fouls.home} awayValue={analysis.predictedStats.fouls.away} colorClass="bg-orange-500" />

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="bg-slate-900/50 p-3 rounded-lg text-center">
                    <span className="text-[10px] text-slate-400 uppercase">Prob. Pênalti</span>
                    <div className={`text-lg font-bold ${analysis.predictedStats.penaltyProb > 50 ? 'text-emerald-400' : 'text-slate-300'}`}>{analysis.predictedStats.penaltyProb}%</div>
                  </div>
                  <div className="bg-slate-900/50 p-3 rounded-lg text-center">
                    <span className="text-[10px] text-slate-400 uppercase">Prob. Cartão Vermelho</span>
                    <div className={`text-lg font-bold ${analysis.predictedStats.redCardProb > 30 ? 'text-red-400' : 'text-slate-300'}`}>{analysis.predictedStats.redCardProb}%</div>
                  </div>
                </div>
              </div>
            </div>

            <ChatAssistant match={match} analysis={analysis} />
          </div>
        )}
      </div>
    </div>
  );
};

export default function App() {
  const [view, setView] = useState<'list' | 'detail'>('list');
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Navigation State
  const [activeTab, setActiveTab] = useState('games');
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Hierarchical Navigation State (Country -> League -> Match)
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [selectedLeague, setSelectedLeague] = useState<string | null>(null);

  const handleMatchClick = (match: Match) => {
    setSelectedMatch(match);
    setAnalysis(null); 
    setView('detail');
  };

  const handleBack = () => {
    setView('list');
    setSelectedMatch(null);
  };

  const handleAnalyze = async () => {
    if (!selectedMatch) return;
    setLoading(true);
    try {
      const result = await analyzeMatch(selectedMatch);
      setAnalysis(result);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Reset logic for "Browse" tab when leaving
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    // Optional: reset deeper navigation when switching tabs
    // setSelectedCountry(null);
    // setSelectedLeague(null);
  }

  // Determine content based on state hierarchy
  const renderContent = () => {
    if (view === 'detail' && selectedMatch) {
      return (
        <MatchDetail 
          match={selectedMatch} 
          analysis={analysis} 
          loading={loading} 
          onBack={handleBack} 
          onAnalyze={handleAnalyze} 
        />
      );
    }

    if (activeTab === 'news') {
      return <NotificationsList notifications={MOCK_NOTIFICATIONS} />;
    }

    // --- BROWSE TAB LOGIC (Future Games Navigation) ---
    if (activeTab === 'browse') {
      // Step 1: Country Selection
      if (!selectedCountry) {
        return <CountryList onSelectCountry={setSelectedCountry} />;
      }

      // Step 2: League Selection (Filtered by Country)
      if (!selectedLeague) {
        // Get leagues available in selected country from matches
        const leaguesInCountry = Array.from(new Set(
          MOCK_MATCHES.filter(m => m.country === selectedCountry).map(m => m.league)
        ));
        return (
          <LeagueList 
            country={selectedCountry}
            leagues={leaguesInCountry} 
            onSelectLeague={setSelectedLeague}
            onBack={() => setSelectedCountry(null)}
          />
        );
      }

      // Step 3: Future Matches List (Filtered by League + Future Date)
      // Filter: In League AND (Date > Today OR explicitly marked as future in Mock)
      // For demo purposes using timestamp check
      const todayTs = new Date().setHours(0,0,0,0);
      const futureMatches = MOCK_MATCHES.filter(m => 
        m.league === selectedLeague && 
        m.country === selectedCountry &&
        m.timestamp > todayTs // Only future matches
      );

      const headerContent = (
         <div className="flex justify-between items-center mb-3 bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-cyan-400" />
            <span className="font-bold text-slate-200">Jogos Futuros • {selectedLeague}</span>
          </div>
          <button 
            onClick={() => setSelectedLeague(null)}
            className="text-xs bg-slate-700 hover:bg-slate-600 text-white px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors"
          >
            <ArrowLeft className="w-3 h-3" />
            Ligas
          </button>
        </div>
      );

      return (
        <MatchList 
          matches={futureMatches} 
          onSelectMatch={handleMatchClick} 
          emptyMessage="Nenhum jogo futuro agendado nesta liga."
          headerContent={headerContent}
        />
      );
    }
    // --- END BROWSE LOGIC ---

    // Default "Games" or "Live" view
    let matches = MOCK_MATCHES;
    if (activeTab === 'live') {
      matches = matches.filter(m => m.status === 'Live');
    } else if (activeTab === 'games') {
      // Strict filtering for "Today" tab: only today, live, or tomorrow
      matches = matches.filter(m => m.date === 'Hoje' || m.status === 'Live' || m.date === 'Amanhã');
    }
    
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      matches = matches.filter(m => 
        m.homeTeam.name.toLowerCase().includes(q) || 
        m.awayTeam.name.toLowerCase().includes(q) ||
        m.league.toLowerCase().includes(q)
      );
    }

    let emptyMsg = "Nenhum jogo encontrado.";
    if (activeTab === 'live') emptyMsg = "Nenhum jogo ao vivo agora.";

    return (
      <MatchList 
        matches={matches} 
        onSelectMatch={handleMatchClick} 
        emptyMessage={emptyMsg}
      />
    );
  };

  return (
    <div className="h-full flex flex-col bg-slate-950 max-w-md mx-auto shadow-2xl overflow-hidden relative">
      
      <header className="p-4 pb-2 flex justify-between items-center bg-slate-950 z-10 shrink-0 h-[60px]">
        {searchOpen ? (
          <div className="flex-1 flex items-center gap-2 animate-in slide-in-from-right-10 duration-300">
             <div className="flex-1 flex items-center gap-2 bg-slate-800 rounded-xl px-3 py-2.5 shadow-inner border border-slate-700/50">
                <Search className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  type="text"
                  autoFocus
                  placeholder="Buscar times, ligas..."
                  className="bg-transparent border-none focus:outline-none text-sm text-white w-full placeholder:text-slate-500 h-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery.length > 0 && (
                  <button 
                    onClick={() => setSearchQuery('')} 
                    className="p-1 bg-slate-700 rounded-full hover:bg-slate-600 transition-colors"
                  >
                    <X className="w-3 h-3 text-slate-300" />
                  </button>
                )}
             </div>
             <button 
                onClick={() => { setSearchOpen(false); setSearchQuery(''); }} 
                className="text-sm font-medium text-slate-400 hover:text-white px-1 transition-colors whitespace-nowrap"
             >
               Cancelar
             </button>
          </div>
        ) : (
          <>
            <div>
              <h1 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400">
                  BET ANALYZER
                </span>
                <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded">AI</span>
              </h1>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => setSearchOpen(true)}
                className="p-2 text-slate-400 hover:text-white transition-colors cursor-pointer hover:bg-slate-800/50 rounded-full"
              >
                <Search className="w-5 h-5" />
              </button>
              <button 
                onClick={() => {
                  setActiveTab('news');
                  setView('list');
                }}
                className="p-2 text-slate-400 hover:text-white transition-colors relative cursor-pointer hover:bg-slate-800/50 rounded-full"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full"></span>
              </button>
            </div>
          </>
        )}
      </header>

      {renderContent()}

      {view === 'list' && (
        <nav className="bg-slate-950 border-t border-slate-800/50 shrink-0 pb-safe z-10">
          <div className="flex justify-around items-center h-16">
            <button 
              onClick={() => handleTabChange('games')}
              className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${activeTab === 'games' ? 'text-emerald-400' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <Activity className="w-6 h-6" />
              <span className="text-[10px] font-medium">Hoje</span>
            </button>
            
            <button 
              onClick={() => handleTabChange('browse')}
              className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${activeTab === 'browse' ? 'text-emerald-400' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <Globe className="w-6 h-6" />
              <span className="text-[10px] font-medium">Explorar</span>
            </button>

            <button 
              onClick={() => handleTabChange('live')}
              className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${activeTab === 'live' ? 'text-emerald-400' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <div className="relative">
                <Zap className={`w-6 h-6 ${activeTab === 'live' ? 'fill-emerald-400/20' : ''}`} />
                {activeTab !== 'live' && <span className="absolute -top-1 -right-0.5 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>}
              </div>
              <span className="text-[10px] font-medium">Ao Vivo</span>
            </button>
            <button 
              onClick={() => handleTabChange('news')}
              className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${activeTab === 'news' ? 'text-emerald-400' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <AlertTriangle className="w-6 h-6" />
              <span className="text-[10px] font-medium">Alertas</span>
            </button>
          </div>
        </nav>
      )}
    </div>
  );
}
