
import React, { useState } from 'react';
import { UserSettings, Currency, CategoryLimit, ToneType } from '../types';
import { BASE_CATEGORIES } from '../constants';
import { Check, AlertCircle, ChevronRight } from 'lucide-react';

interface OnboardingProps {
  onComplete: (settings: UserSettings) => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [currency, setCurrency] = useState<Currency>('₸');
  const [income, setIncome] = useState(0);
  const [tone, setTone] = useState<ToneType>('soft');
  const [limits, setLimits] = useState<CategoryLimit[]>(
    BASE_CATEGORIES.map(c => ({ category: c, limit: 0 }))
  );
  const [error, setError] = useState('');

  const totalLimits = limits.reduce((sum, l) => sum + l.limit, 0);
  // Так как обязательные платежи удалены, свободный бюджет равен доходу
  const freeBudget = income;

  const handleNext = () => {
    if (step === 2 && income <= 0) {
      setError('Введите ваш доход');
      return;
    }
    if (step === 3 && totalLimits > income) {
      setError('Ваши лимиты трат превышают доходы!');
      return;
    }
    setError('');
    if (step < 3) setStep(step + 1);
    else {
      onComplete({
        currency,
        monthlyIncome: income,
        essentialPayments: 0,
        freeBudget,
        monthStart: 1,
        monthEnd: 31,
        tone,
        limits
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#000B1E] flex flex-col p-6 items-center justify-center overflow-y-auto">
      <div className="w-full max-w-md glass-panel p-8 rounded-3xl space-y-8">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-sky-500/20 rounded-2xl mx-auto flex items-center justify-center text-sky-400 drop-shadow-[0_0_15px_rgba(56,189,248,0.4)]">
            <Check size={32} />
          </div>
          <h1 className="text-2xl font-bold electric-glow">Настройка Агента</h1>
          <div className="flex justify-center space-x-2">
            {[1, 2, 3].map(i => (
              <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${step === i ? 'w-8 bg-sky-500' : 'w-2 bg-slate-700'}`} />
            ))}
          </div>
        </div>

        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-4">
              <label className="text-sm font-medium text-slate-400 uppercase tracking-wider">Выберите валюту</label>
              <div className="grid grid-cols-3 gap-3">
                {(['₸', '₽', 'BYN'] as Currency[]).map(c => (
                  <button
                    key={c}
                    onClick={() => setCurrency(c)}
                    className={`p-4 rounded-2xl border transition-all ${currency === c ? 'border-sky-500 bg-sky-500/10 text-sky-400' : 'border-white/5 bg-white/5 text-slate-500'}`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <label className="text-sm font-medium text-slate-400 uppercase tracking-wider">Тон агента</label>
              <div className="grid grid-cols-3 gap-3">
                {(['soft', 'strict', 'hard'] as ToneType[]).map(t => (
                  <button
                    key={t}
                    onClick={() => setTone(t)}
                    className={`p-3 rounded-2xl border text-xs capitalize transition-all ${tone === t ? 'border-sky-500 bg-sky-500/10 text-sky-400' : 'border-white/5 bg-white/5 text-slate-500'}`}
                  >
                    {t === 'soft' ? 'Мягкий' : t === 'strict' ? 'Строгий' : 'Жёсткий'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-400">Общий месячный доход</label>
              <input
                type="number"
                value={income || ''}
                onChange={(e) => setIncome(Number(e.target.value))}
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-2xl font-bold text-sky-400 focus:outline-none focus:border-sky-500/50"
                placeholder="0"
              />
            </div>
            <div className="p-4 bg-sky-500/5 rounded-2xl border border-sky-500/20">
              <p className="text-xs text-slate-400">Бюджет на месяц:</p>
              <p className="text-xl font-bold text-sky-400">{income} {currency}</p>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <p className="text-xs text-slate-400 text-center italic">
              «Установи месячные лимиты, чтобы контролёр знал, когда тебя останавливать от трат».
            </p>
            <div className="max-h-60 overflow-y-auto space-y-4 pr-2">
              {limits.map((l, idx) => (
                <div key={l.category} className="flex items-center space-x-3">
                  <span className="flex-1 text-xs text-slate-300 truncate">{l.category}</span>
                  <input
                    type="number"
                    value={l.limit || ''}
                    onChange={(e) => {
                      const newLimits = [...limits];
                      newLimits[idx].limit = Number(e.target.value);
                      setLimits(newLimits);
                    }}
                    className="w-24 bg-white/5 border border-white/10 rounded-lg p-2 text-right text-sm text-sky-400"
                    placeholder="0"
                  />
                </div>
              ))}
            </div>
            <div className={`p-4 rounded-2xl border transition-all ${totalLimits > income ? 'bg-red-500/10 border-red-500/50' : 'bg-emerald-500/10 border-emerald-500/50'}`}>
              <div className="flex justify-between text-xs font-medium">
                <span className="text-slate-400">Сумма лимитов:</span>
                <span className={totalLimits > income ? 'text-red-400' : 'text-emerald-400'}>{totalLimits} / {income}</span>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-center space-x-2 text-red-400 text-sm p-3 bg-red-400/10 border border-red-400/20 rounded-xl">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <button
          onClick={handleNext}
          className="w-full bg-[#4169E1] hover:bg-[#3558C0] text-white font-bold py-4 rounded-2xl flex items-center justify-center transition-all group neon-button"
        >
          {step === 3 ? 'Готово' : 'Далее'}
          <ChevronRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
};
