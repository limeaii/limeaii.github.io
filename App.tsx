
import React from 'react';
import { useAuth } from './hooks/useAuth.tsx';
import AuthPage from './components/AuthPage.tsx';
import MainApp from './components/MainApp.tsx';

const App: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="bg-slate-900 text-white min-h-screen font-sans">
      {user ? <MainApp /> : <AuthPage />}
    </div>
  );
};

export default App;
