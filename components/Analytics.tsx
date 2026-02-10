
import React from 'react';
import { UserSettings, Transaction } from '../types';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, CartesianGrid, Tooltip, Cell } from 'recharts';
import { COLORS } from '../constants';

interface AnalyticsProps {
  settings: UserSettings;
  transactions: Transaction[];
}

export const Analytics: React.FC<AnalyticsProps> = ({ settings, transactions }) => {
  const expenses = transactions.filter(t => t.type === 'expense');

  // Weekly analysis (last 4 weeks)
  const getWeeklyData = () => {
    const data: any[] = [];
    for (let i = 3; i >= 0; i--) {
      const start = new Date();
      start.setDate(start.getDate() - (i * 7 + 7));
      const end = new Date();
      end.setDate(end.getDate() - (i * 7));
      
      const weekSpent = expenses.filter(t => {
        const d = new Date(t.date);
        return d >= start && d <= end;
      }).reduce((sum, t) => sum + t.amount, 0);

      data.push({ name: i === 0 ? 'Тек.' : `${i + 1}н. назад`, amount: weekSpent });
    }
    return data;
  };

  const weeklyData = getWeeklyData();
  const avgWeekly = weeklyData.reduce((sum, d) => sum + d.amount, 0) / 4;
  
  // Impulsive spend % check for current month
  const today = new Date();
  const currentMonth = today.toISOString().substring(0, 7);
  const monthTx = expenses.filter(t => t.date.startsWith(currentMonth));
  const totalMonth = monthTx.reduce((sum, t) => sum + t.amount, 0);
  const impulsiveMonth = monthTx.filter(t => t.obligation === 'Impulse' || t.obligation === 'Optional').reduce((sum, t) => sum + t.amount, 0);
  const impulsePercent = totalMonth > 0 ? Math.round((impulsiveMonth / totalMonth) * 100) : 0;

  return (
    <div className="space-y-6 pb-8">
      <h1 className="text-xl font-bold text-white electric-glow">Аналитика трат</h1>

      {/* Key Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="glass-panel p-4 rounded-2xl">
          <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Ср. в неделю</p>
          <p className="text-lg font-bold text-sky-400">{Math.round(avgWeekly).toLocaleString()} {settings.currency}</p>
        </div>
        <div className="glass-panel p-4 rounded-2xl">
          <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Необязательные</p>
          <p className={`text-lg font-bold ${impulsePercent > 30 ? 'text-red-400' : 'text-emerald-400'}`}>{impulsePercent}%</p>
        </div>
      </div>

      {/* Weekly Trend Chart */}
      <div className="glass-panel p-6 rounded-3xl space-y-4">
        <h3 className="text-sm font-semibold text-slate-300">Недельный тренд</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10}} />
              <Tooltip 
                cursor={{fill: 'rgba(56, 189, 248, 0.05)'}}
                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                itemStyle={{ color: '#38BDF8', fontSize: '12px' }}
              />
              <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                {weeklyData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index === 3 ? '#38BDF8' : '#1e293b'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Monthly Report Summary Card */}
      <div className="glass-panel p-6 rounded-3xl space-y-4">
        <h3 className="text-sm font-semibold text-slate-300">Итог месяца</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-400">Всего расходов:</span>
            <span className="text-white font-bold">{totalMonth.toLocaleString()} {settings.currency}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-400">Свободные траты:</span>
            <span className="text-sky-400 font-bold">{impulsiveMonth.toLocaleString()} {settings.currency}</span>
          </div>
          <div className="pt-4 border-t border-white/5 italic text-xs text-slate-500 leading-relaxed">
            «Ваш темп трат в этом месяце {impulsePercent > 40 ? 'выше среднего. Попробуйте сократить необязательные покупки в категории Одежда и Подарки.' : 'отличный! Вы придерживаетесь плана и сохраняете баланс.'}»
          </div>
        </div>
      </div>
    </div>
  );
};
