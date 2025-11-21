import React from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts';
import { Team } from '../types';

interface Props {
  homeTeam: Team;
  awayTeam: Team;
}

const AnalysisChart: React.FC<Props> = ({ homeTeam, awayTeam }) => {
  const data = [
    {
      subject: 'Ataque',
      A: homeTeam.stats.attack,
      B: awayTeam.stats.attack,
      fullMark: 100,
    },
    {
      subject: 'Defesa',
      A: homeTeam.stats.defense,
      B: awayTeam.stats.defense,
      fullMark: 100,
    },
    {
      subject: 'Meio',
      A: homeTeam.stats.midfield,
      B: awayTeam.stats.midfield,
      fullMark: 100,
    },
    {
      subject: 'Forma',
      A: homeTeam.recentForm.filter(r => r === 'V').length * 20, // Rough estimate
      B: awayTeam.recentForm.filter(r => r === 'V').length * 20,
      fullMark: 100,
    },
    {
      subject: 'Posição',
      // Invert league position for chart (lower rank is better)
      A: Math.max(0, 100 - (homeTeam.leaguePosition * 5)), 
      B: Math.max(0, 100 - (awayTeam.leaguePosition * 5)),
      fullMark: 100,
    },
  ];

  return (
    <div className="w-full h-64 bg-slate-900 rounded-xl p-2 shadow-lg border border-slate-800">
      <h3 className="text-center text-sm font-semibold text-slate-400 mb-2">Comparativo de Performance</h3>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
          <PolarGrid stroke="#334155" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12 }} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
          <Radar
            name={homeTeam.shortName}
            dataKey="A"
            stroke="#10b981"
            strokeWidth={2}
            fill="#10b981"
            fillOpacity={0.3}
          />
          <Radar
            name={awayTeam.shortName}
            dataKey="B"
            stroke="#3b82f6"
            strokeWidth={2}
            fill="#3b82f6"
            fillOpacity={0.3}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f1f5f9' }}
            itemStyle={{ color: '#f1f5f9' }}
          />
          <Legend wrapperStyle={{ paddingTop: '10px' }}/>
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AnalysisChart;