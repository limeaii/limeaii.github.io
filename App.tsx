import React from 'react';
import { useAuth } from './hooks/useAuth.tsx';
import AuthPage from './components/AuthPage.tsx';
import MainApp from './components/MainApp.tsx';

const App: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="bg-slate-900 text-white min-h-screen font-sans flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 text-white min-h-screen font-sans">
      {user ? <MainApp /> : <AuthPage />}
    </div>
  );
};

export default App;