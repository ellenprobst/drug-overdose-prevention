import React, { useState } from 'react';
import { SafetySession } from './components/SafetySession';
import { SupportChat } from './components/SupportChat';
import { ContactsManager } from './components/ContactsManager';
import { Resources } from './components/Resources';
import { SessionHistory } from './components/SessionHistory';
import { BottomNavigation } from './components/BottomNavigation';
import { AppView } from './types';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.HOME);

  // Simple Router
  const renderView = () => {
    switch (currentView) {
      case AppView.SESSION:
        return <SafetySession onExit={() => setCurrentView(AppView.HOME)} onNavigate={setCurrentView} />;
      case AppView.SUPPORT:
        return <SupportChat />;
      case AppView.RESOURCES:
        return <Resources />;
      case AppView.CONTACTS:
        return <ContactsManager onNavigate={setCurrentView} />;
      case AppView.ESCALATION:
        return <ContactsManager onNavigate={setCurrentView} />; // Re-use ContactsManager which now conditionally renders Settings
      case AppView.HISTORY:
        return <SessionHistory />;
      case AppView.HOME:
      default:
        return <Home onViewChange={setCurrentView} />;
    }
  };

  const isSessionActive = currentView === AppView.SESSION;

  return (
    <div className="h-screen w-full bg-warm-50 text-haven-900 overflow-hidden font-sans flex flex-col">
      <div className={`flex-1 h-full w-full relative ${!isSessionActive ? 'pb-20' : ''}`}>
        {renderView()}
      </div>
      
      {!isSessionActive && (
        <BottomNavigation currentView={currentView} onNavigate={setCurrentView} />
      )}
    </div>
  );
};

const Home: React.FC<{ onViewChange: (view: AppView) => void }> = ({ onViewChange }) => {
  return (
    <div className="h-full flex flex-col p-8 justify-center max-w-lg mx-auto w-full relative">
      
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-haven-100/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-haven-100/30 rounded-full blur-3xl translate-y-1/4 -translate-x-1/4 pointer-events-none"></div>

      {/* Header */}
      <header className="mb-16 text-center z-10">
        <h1 className="text-5xl font-extralight text-haven-800 tracking-wide mb-4">Haven</h1>
        <p className="text-haven-500 font-light text-lg">Your safety companion.</p>
      </header>

      {/* Main Call to Action */}
      <section className="mb-8 w-full z-10">
        <button 
            onClick={() => onViewChange(AppView.SESSION)}
            className="w-full bg-gradient-to-br from-haven-400 to-haven-600 text-white rounded-[40px] p-10 shadow-2xl shadow-haven-200/60 transform transition-all active:scale-95 hover:shadow-haven-300/50 group relative overflow-hidden"
        >
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-20 transition-opacity"></div>
            <div className="flex flex-col items-center justify-center text-center space-y-3 relative">
                <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mb-2 animate-pulse-slow">
                   <div className="w-8 h-8 rounded-full bg-white"></div>
                </div>
                <h2 className="text-3xl font-medium tracking-wide">Start Session</h2>
                <p className="text-haven-50 opacity-90 font-light text-sm tracking-widest uppercase mt-2">Real-time Monitoring</p>
            </div>
        </button>
      </section>

      <div className="mt-8 text-center z-10">
         <p className="text-haven-400 font-light text-sm italic">"You deserve to be safe."</p>
      </div>
    </div>
  );
};

export default App;