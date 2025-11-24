import React from 'react';
import { Home, MessageCircleHeart, Users, BookOpen, History } from 'lucide-react';
import { AppView } from '../types';

interface BottomNavigationProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({ currentView, onNavigate }) => {
  const navItems = [
    { view: AppView.HOME, label: 'Home', icon: Home },
    { view: AppView.SUPPORT, label: 'Support', icon: MessageCircleHeart },
    { view: AppView.RESOURCES, label: 'Resources', icon: BookOpen },
    { view: AppView.CONTACTS, label: 'Contacts', icon: Users },
    { view: AppView.HISTORY, label: 'History', icon: History },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-haven-100 pb-safe pt-2 px-2 flex justify-between items-center z-50 h-[84px] shadow-[0_-4px_20px_rgba(0,0,0,0.02)]">
      {navItems.map((item) => {
        const isActive = currentView === item.view;
        return (
          <button
            key={item.view}
            onClick={() => onNavigate(item.view)}
            className={`flex flex-col items-center gap-1 p-2 rounded-2xl w-full transition-all duration-300 ${
              isActive ? 'text-haven-600 -translate-y-1' : 'text-haven-300 hover:text-haven-400'
            }`}
          >
            <div className={`p-1.5 rounded-full transition-colors ${isActive ? 'bg-haven-50' : 'bg-transparent'}`}>
              <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
            </div>
            <span className={`text-[10px] font-medium tracking-wide transition-opacity ${isActive ? 'opacity-100' : 'opacity-70'}`}>
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};