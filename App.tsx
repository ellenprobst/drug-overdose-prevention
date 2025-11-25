import React, { useState, useEffect } from 'react';
import { SafetySession } from './components/SafetySession';
import { SupportChat } from './components/SupportChat';
import { ContactsManager } from './components/ContactsManager';
import { Resources } from './components/Resources';
import { SessionHistory } from './components/SessionHistory';
import { BottomNavigation } from './components/BottomNavigation';
import { Onboarding } from './components/Onboarding';
import { SafetyPlanEditor } from './components/SafetyPlanEditor';
import { AppView } from './types';
import { ShieldCheck, Info, X } from 'lucide-react';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.HOME);
  // DEMO: Force onboarding to show every time by default
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean>(false);

  const handleOnboardingComplete = () => {
    localStorage.setItem('haven_onboarding_completed', 'true');
    setHasCompletedOnboarding(true);
  };

  // Simple Router
  const renderView = () => {
    if (!hasCompletedOnboarding) {
      return <Onboarding onComplete={handleOnboardingComplete} />;
    }

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
        return <SafetyPlanEditor onExit={() => setCurrentView(AppView.HOME)} />;
      case AppView.HISTORY:
        return <SessionHistory />;
      case AppView.HOME:
      default:
        return <Home onViewChange={setCurrentView} />;
    }
  };

  const isSessionActive = currentView === AppView.SESSION;

  return (
    // Desktop/Browser Background Wrapper
    <div className="min-h-screen w-full bg-neutral-100 flex items-center justify-center p-4 font-sans text-haven-900">
      
      {/* Mobile Device Frame */}
      <div className="w-full max-w-[400px] h-[850px] max-h-[90vh] bg-warm-50 rounded-[3rem] shadow-2xl overflow-hidden relative border-[8px] border-white ring-1 ring-black/5 flex flex-col">
        
        {/* Visual Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-black rounded-b-2xl z-50 pointer-events-none"></div>

        {/* App Content Area */}
        <div className={`flex-1 h-full w-full relative overflow-hidden flex flex-col bg-warm-50 ${!isSessionActive && hasCompletedOnboarding ? 'pb-[84px]' : ''}`}>
          {renderView()}
        </div>
        
        {/* Bottom Navigation (Only show if onboarding is done and not in session) */}
        {hasCompletedOnboarding && !isSessionActive && (
          <BottomNavigation currentView={currentView} onNavigate={setCurrentView} />
        )}

      </div>
    </div>
  );
};

const Home: React.FC<{ onViewChange: (view: AppView) => void }> = ({ onViewChange }) => {
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [hasClickedInfo, setHasClickedInfo] = useState(() => {
    return sessionStorage.getItem('haven_info_clicked') === 'true';
  });
  const [showTooltip, setShowTooltip] = useState(!hasClickedInfo);

  useEffect(() => {
    // Auto-hide tooltip after 6 seconds if it hasn't been clicked
    if (showTooltip) {
      const timer = setTimeout(() => {
        setShowTooltip(false);
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [showTooltip]);

  const handleInfoClick = () => {
    setShowInfoModal(true);
    setHasClickedInfo(true);
    setShowTooltip(false);
    sessionStorage.setItem('haven_info_clicked', 'true');
  };

  return (
    <div className="h-full flex flex-col p-8 justify-center w-full relative">
      
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-haven-100/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-haven-100/30 rounded-full blur-3xl translate-y-1/4 -translate-x-1/4 pointer-events-none"></div>

      {/* Info Button Top Right */}
      <div className="absolute top-6 right-6 z-20">
         <button 
            onClick={handleInfoClick}
            className={`p-2 rounded-full text-haven-400 bg-white/60 hover:bg-white hover:text-haven-600 shadow-sm border border-haven-50 transition-all ${!hasClickedInfo ? 'animate-attention' : ''}`}
         >
            <Info size={20} />
         </button>
         
         {/* Floating Tooltip */}
         {showTooltip && (
            <div className="absolute top-full right-0 mt-2 w-32 bg-haven-800 text-white text-[10px] py-1.5 px-3 rounded-lg shadow-lg animate-fade-in pointer-events-none">
                <div className="absolute -top-1 right-3 w-2 h-2 bg-haven-800 rotate-45"></div>
                Demo info here →
            </div>
         )}
      </div>

      {/* Info Modal */}
      {showInfoModal && (
        <div className="absolute inset-0 z-50 bg-black/20 backdrop-blur-sm flex items-center justify-center p-6 animate-fade-in">
           <div className="bg-white rounded-3xl p-6 shadow-2xl max-w-sm w-full relative overflow-y-auto max-h-[80vh]">
              <button 
                onClick={() => setShowInfoModal(false)}
                className="absolute top-4 right-4 text-haven-300 hover:text-haven-600 p-1"
              >
                <X size={20} />
              </button>
              
              <h3 className="text-xl font-light text-haven-800 mb-4">About this Demo App</h3>
              <div className="space-y-4 text-sm text-haven-600 leading-relaxed">
                 <p className="font-medium">
                    A privacy-first demo showing how real-time overdose support could work.
                 </p>
                 
                 <div>
                    <h4 className="font-bold text-xs uppercase tracking-wider text-haven-400 mb-2">Features</h4>
                    <ul className="list-disc pl-4 space-y-1 text-xs">
                        <li>User-controlled monitoring for solo substance use</li>
                        <li>Emergency alerts to EMS, peers, or mentors</li>
                        <li>Post-overdose support and community resources</li>
                        <li>Hotspot mapping and optional What3Words location</li>
                        <li>Peer and mentor connections</li>
                    </ul>
                 </div>

                 <div>
                    <h4 className="font-bold text-xs uppercase tracking-wider text-haven-400 mb-2">Privacy Focus</h4>
                    <ul className="list-disc pl-4 space-y-1 text-xs">
                        <li>You control your data at all times</li>
                        <li>Minimal collection, with local-only storage options</li>
                        <li>Clear signals when location is used</li>
                        <li>Consent is explicit and revocable</li>
                    </ul>
                 </div>

                 <div className="bg-haven-50 p-3 rounded-xl border border-haven-100 text-xs text-haven-500 mt-2">
                    <strong>Disclaimer:</strong> This is a demo app. Features and data are simulated.
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* Header */}
      <header className="mb-16 text-center z-10">
        <h1 className="text-5xl font-extralight text-haven-800 tracking-wide mb-4">Haven</h1>
        <p className="text-haven-500 font-light text-lg">Your safety companion.</p>
      </header>

      {/* Main Call to Action */}
      <section className="mb-6 w-full z-10">
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

      {/* Secondary Action: Safety Plan */}
      <section className="w-full z-10 flex justify-center">
          <button 
            onClick={() => onViewChange(AppView.ESCALATION)}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white border border-haven-100 text-haven-600 shadow-sm hover:bg-haven-50 transition-all"
          >
            <ShieldCheck size={18} />
            <span className="font-medium text-sm">My Safety Plan</span>
          </button>
      </section>

      <div className="mt-8 text-center z-10">
         <p className="text-haven-400 font-light text-sm italic">"You deserve to be safe."</p>
      </div>
    </div>
  );
};

export default App;