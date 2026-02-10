
import React, { useState } from 'react';
import { Transaction, UserSettings, ObligationType } from '../types';
import { Edit2, Trash2, Check, X, Filter, Trash } from 'lucide-react';
import { BASE_CATEGORIES } from '../constants';

interface HistoryProps {
  settings: UserSettings;
  transactions: Transaction[];
  onUpdate: (t: Transaction) => void;
  onDelete: (id: string) => void;
}

export const History: React.FC<HistoryProps> = ({ settings, transactions, onUpdate, onDelete }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Transaction>>({});
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);

  const sortedTx = [...transactions].sort((a, b) => b.timestamp - a.timestamp);

  const startEdit = (t: Transaction) => {
    setEditingId(t.id);
    setEditForm(t);
  };

  const handleSave = () => {
    if (editingId && editForm) {
      onUpdate(editForm as Transaction);
      setEditingId(null);
    }
  };

  const obligationBadge = (type?: ObligationType) => {
    switch (type) {
      case 'Essential': return 'text-emerald-400 bg-emerald-400/10';
      case 'Optional': return 'text-sky-400 bg-sky-400/10';
      case 'Impulse': return 'text-amber-400 bg-amber-400/10';
      default: return 'text-slate-400 bg-slate-400/10';
    }
  };

  return (
    <div className="space-y-4 pb-8">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold text-white electric-glow">История операций</h1>
        <button className="p-2 text-slate-500 hover:text-slate-300 transition-colors">
          <Filter size={18} />
        </button>
      </header>

      <div className="space-y-3">
        {sortedTx.map((t) => (
          <div key={t.id} className="glass-panel rounded-2xl p-4 transition-all hover:border-white/20 relative group">
            {editingId === t.id ? (
              <div className="space-y-3 animate-in fade-in duration-300">
                <div className="flex space-x-2">
                  <select 
                    value={editForm.category}
                    onChange={(e) => setEditForm({...editForm, category: e.target.value})}
                    className="flex-1 bg-slate-800 border border-white/10 rounded-lg p-2 text-xs text-white"
                  >
                    {BASE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <input 
                    type="number"
                    value={editForm.amount}
                    onChange={(e) => setEditForm({...editForm, amount: Number(e.target.value)})}
                    className="w-20 bg-slate-800 border border-white/10 rounded-lg p-2 text-xs text-white"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <button onClick={() => setEditingId(null)} className="p-2 text-slate-400 hover:text-white"><X size={16}/></button>
                  <button onClick={handleSave} className="p-2 text-sky-400 hover:text-sky-300"><Check size={16}/></button>
                </div>
              </div>
            ) : (
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-slate-500 font-medium">{t.date}</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full uppercase tracking-tighter ${obligationBadge(t.obligation)}`}>
                      {t.obligation || 'Доход'}
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-slate-100">{t.description}</h4>
                  <p className="text-[10px] text-slate-500">{t.category}</p>
                </div>
                <div className="flex flex-col items-end space-y-2">
                  <div className={`text-sm font-bold ${t.type === 'expense' ? 'text-slate-200' : 'text-emerald-400'}`}>
                    {t.type === 'expense' ? '-' : '+'}{t.amount.toLocaleString()} {settings.currency}
                  </div>
                  <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => startEdit(t)} className="p-1.5 text-slate-400 hover:text-sky-400"><Edit2 size={14}/></button>
                    <button onClick={() => setShowDeleteModal(t.id)} className="p-1.5 text-slate-400 hover:text-red-400"><Trash2 size={14}/></button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

        {sortedTx.length === 0 && (
          <div className="py-20 text-center space-y-3">
            <div className="w-12 h-12 bg-slate-900 rounded-full mx-auto flex items-center justify-center text-slate-700">
              <History size={24} />
            </div>
            <p className="text-slate-500 text-sm">Тут пока пусто. Начни записывать траты в чате!</p>
          </div>
        )}
      </div>

      {/* Modern Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowDeleteModal(null)} />
          <div className="relative glass-panel p-8 rounded-3xl max-w-sm w-full space-y-6 text-center animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto text-red-500">
              <Trash size={32} />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-white">Удалить запись?</h3>
              <p className="text-sm text-slate-400">Это действие нельзя отменить. Сумма будет возвращена в бюджет.</p>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-2">
              <button 
                onClick={() => setShowDeleteModal(null)}
                className="py-3 px-4 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-medium transition-all"
              >
                Отмена
              </button>
              <button 
                onClick={() => { onDelete(showDeleteModal); setShowDeleteModal(null); }}
                className="py-3 px-4 bg-red-500 hover:bg-red-400 text-white rounded-2xl font-medium shadow-lg shadow-red-500/20 transition-all"
              >
                Удалить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
