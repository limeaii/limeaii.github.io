
import React from 'react';
import { useAuth } from './hooks/useAuth';
import AuthPage from './components/AuthPage';
import MainApp from './components/MainApp';

const App: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="bg-slate-900 text-white min-h-screen font-sans">
      {user ? <MainApp /> : <AuthPage />}
    </div>
  );
};

export default App;
