
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import QAPanel from './QAPanel';
import ImageGenPanel from './ImageGenPanel';

type ActiveTab = 'qa' | 'image';

const MainApp: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<ActiveTab>('qa');

  const TabButton: React.FC<{ tabName: ActiveTab; label: string; icon: React.ReactNode }> = ({ tabName, label, icon }) => (
    <button
      onClick={() => setActiveTab(tabName)}
      className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
        activeTab === tabName
          ? 'bg-sky-600 text-white'
          : 'text-slate-300 hover:bg-slate-700'
      }`}
    >
      {icon}
      {label}
    </button>
  );

  return (
    <div className="flex flex-col h-screen">
      <header className="flex items-center justify-between p-4 bg-slate-800 border-b border-slate-700 shadow-md">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-500">
            Gemini Creative Suite
          </h1>
          <nav className="flex items-center gap-2">
            <TabButton
              tabName="qa"
              label="Q&A"
              icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7s-8-3.134-8-7c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-.293 5.293a1 1 0 01-1.414 0L10 10.414l-2.293 2.293a1 1 0 01-1.414-1.414l2.293-2.293-2.293-2.293a1 1 0 011.414-1.414L10 7.586l2.293-2.293a1 1 0 011.414 1.414L11.414 9l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" /></svg>}
            />
            <TabButton
              tabName="image"
              label="Image Generation"
              icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" /></svg>}
            />
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-400">{user?.username}</span>
          <button
            onClick={logout}
            className="px-4 py-2 text-sm font-medium text-white bg-slate-600 rounded-md hover:bg-slate-700 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </header>
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        {activeTab === 'qa' && <QAPanel />}
        {activeTab === 'image' && <ImageGenPanel />}
      </main>
    </div>
  );
};

export default MainApp;
