
import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Onboarding } from './components/Onboarding';
import { ChatInterface } from './components/ChatInterface';
import { Overview } from './components/Overview';
import { History } from './components/History';
import { Analytics } from './components/Analytics';
import { UserSettings, Transaction } from './types';
import { dataService } from './services/dataService';

type Tab = 'chat' | 'overview' | 'history' | 'analytics';

const App: React.FC = () => {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>('chat');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedSettings = dataService.getSettings();
    const savedTx = dataService.getTransactions();
    if (savedSettings) {
      setSettings(savedSettings);
    }
    setTransactions(savedTx);
    setIsLoading(false);
  }, []);

  const handleSettingsSave = (newSettings: UserSettings) => {
    dataService.saveSettings(newSettings);
    setSettings(newSettings);
  };

  const handleTransactionAdd = (t: Transaction) => {
    dataService.saveTransaction(t);
    setTransactions(prev => [...prev, t]);
  };

  const handleTransactionUpdate = (t: Transaction) => {
    dataService.updateTransaction(t);
    setTransactions(prev => prev.map(item => item.id === t.id ? t : item));
  };

  const handleTransactionDelete = (id: string) => {
    dataService.deleteTransaction(id);
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#000B1E] flex items-center justify-center">
        <div className="animate-pulse text-sky-400 font-medium">Загрузка системы...</div>
      </div>
    );
  }

  if (!settings) {
    return <Onboarding onComplete={handleSettingsSave} />;
  }

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      <div className="max-w-2xl mx-auto h-full relative">
        {activeTab === 'chat' && (
          <ChatInterface 
            settings={settings} 
            transactions={transactions} 
            onAddTransaction={handleTransactionAdd} 
          />
        )}
        {activeTab === 'overview' && (
          <Overview settings={settings} transactions={transactions} />
        )}
        {activeTab === 'history' && (
          <History 
            settings={settings} 
            transactions={transactions} 
            onUpdate={handleTransactionUpdate} 
            onDelete={handleTransactionDelete}
          />
        )}
        {activeTab === 'analytics' && (
          <Analytics settings={settings} transactions={transactions} />
        )}
      </div>
    </Layout>
  );
};

export default App;
