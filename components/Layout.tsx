
import React from 'react';
import { MessageSquare, LayoutDashboard, History, PieChart, Settings } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: any) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange }) => {
  const tabs = [
    { id: 'chat', label: 'Чат', icon: MessageSquare },
    { id: 'overview', label: 'Обзор', icon: LayoutDashboard },
    { id: 'history', label: 'История', icon: History },
    { id: 'analytics', label: 'Анализ', icon: PieChart },
  ];

  return (
    <div className="flex flex-col h-screen max-h-screen overflow-hidden bg-[#000B1E]">
      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto pb-20 pt-4 px-4 scroll-smooth">
        {children}
      </main>

      {/* Navigation - Apple-style sticky tab bar */}
      <nav className="fixed bottom-0 left-0 right-0 glass-panel border-t border-white/10 px-4 py-2 flex justify-around items-center z-50">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-300 ${
                isActive ? 'text-sky-400 scale-110' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <Icon size={24} className={isActive ? 'drop-shadow-[0_0_8px_rgba(56,189,248,0.5)]' : ''} />
              <span className="text-[10px] mt-1 font-medium">{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};
