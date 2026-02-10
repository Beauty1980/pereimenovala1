
import React from 'react';
import { UserSettings, Transaction } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { getLocalDate, COLORS } from '../constants';
import { Wallet, TrendingUp, AlertTriangle } from 'lucide-react';

interface OverviewProps {
  settings: UserSettings;
  transactions: Transaction[];
}

export const Overview: React.FC<OverviewProps> = ({ settings, transactions }) => {
  const today = getLocalDate();
  const currentMonth = today.substring(0, 7);
  
  const monthTx = transactions.filter(t => t.date.startsWith(currentMonth) && t.type === 'expense');
  const totalSpent = monthTx.reduce((sum, t) => sum + t.amount, 0);
  const remaining = settings.freeBudget - totalSpent;
  const isRedZone = totalSpent > settings.freeBudget;

  const dataByCategory = settings.limits.map(limit => {
    const spent = monthTx
      .filter(t => t.category === limit.category)
      .reduce((sum, t) => sum + t.amount, 0);
    return { name: limit.category, value: spent };
  }).filter(d => d.value > 0);

  const CHART_COLORS = [
    '#38BDF8', '#818CF8', '#C084FC', '#F472B6', '#FB7185',
    '#FBBF24', '#34D399', '#2DD4BF', '#A78BFA'
  ];

  return (
    <div className="space-y-6 pb-4">
      <header className="flex justify-between items-center mb-2">
        <h1 className="text-xl font-bold text-white electric-glow">Обзор за месяц</h1>
        <div className="text-[10px] text-slate-500 uppercase tracking-widest">{today}</div>
      </header>

      {/* Hero Card */}
      <div className={`p-6 rounded-3xl relative overflow-hidden transition-all duration-500 ${isRedZone ? 'bg-red-950/40 border-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.2)]' : 'glass-panel shadow-2xl shadow-sky-950/20'}`}>
        <div className="flex justify-between items-start relative z-10">
          <div>
            <p className="text-xs text-slate-400 font-medium uppercase mb-1">Свободный остаток</p>
            <h2 className={`text-4xl font-black ${isRedZone ? 'text-red-400 red-glow' : 'text-sky-400 electric-glow'}`}>
              {remaining.toLocaleString()} {settings.currency}
            </h2>
          </div>
          <div className={`p-3 rounded-2xl ${isRedZone ? 'bg-red-500/20 text-red-500' : 'bg-sky-500/20 text-sky-500'}`}>
            {isRedZone ? <AlertTriangle size={24} /> : <Wallet size={24} />}
          </div>
        </div>
        
        <div className="mt-8 space-y-4">
          <div className="flex justify-between text-xs">
            <span className="text-slate-400">Потрачено из плана: {totalSpent.toLocaleString()}</span>
            <span className="text-slate-400">{Math.round((totalSpent / settings.freeBudget) * 100)}%</span>
          </div>
          <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-1000 ${isRedZone ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'bg-sky-500 shadow-[0_0_10px_rgba(56,189,248,0.5)]'}`}
              style={{ width: `${Math.min(100, (totalSpent / settings.freeBudget) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Charts & Limits */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-panel p-6 rounded-3xl min-h-[300px]">
          <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center">
            <TrendingUp size={16} className="mr-2 text-sky-400" />
            Категории
          </h3>
          <div className="h-52">
            {dataByCategory.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dataByCategory}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {dataByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                    itemStyle={{ color: '#e2e8f0', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500 text-sm">Нет данных за этот месяц</div>
            )}
          </div>
        </div>

        <div className="glass-panel p-6 rounded-3xl space-y-4">
          <h3 className="text-sm font-semibold text-slate-300">Лимиты</h3>
          <div className="space-y-4 max-h-[250px] overflow-y-auto pr-2">
            {settings.limits.filter(l => l.limit > 0).map(limit => {
              const spent = monthTx.filter(t => t.category === limit.category).reduce((sum, t) => sum + t.amount, 0);
              const over = spent > limit.limit;
              return (
                <div key={limit.category} className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400">{limit.category}</span>
                    <span className={over ? 'text-red-400' : 'text-slate-300'}>{spent} / {limit.limit}</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-700 ${over ? 'bg-red-500' : 'bg-sky-400/50'}`}
                      style={{ width: `${Math.min(100, (spent / limit.limit) * 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
