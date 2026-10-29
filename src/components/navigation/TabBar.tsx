import React from 'react';
import { Home, Flower2, BookOpen, Headphones, User } from 'lucide-react';

export type TabKey = 'home' | 'meditation' | 'buddhist' | 'sound' | 'profile';

interface TabBarProps {
  currentTab: TabKey;
  onSelectTab: (tab: TabKey) => void;
  hasMiniPlayer: boolean;
}

export const TabBar: React.FC<TabBarProps> = ({ currentTab, onSelectTab, hasMiniPlayer }) => {
  const tabs: { key: TabKey; label: string; icon: React.ElementType }[] = [
    { key: 'home', label: 'Trang chủ', icon: Home },
    { key: 'meditation', label: 'Thiền & Thở', icon: Flower2 },
    { key: 'buddhist', label: 'Phật pháp', icon: BookOpen },
    { key: 'sound', label: 'Âm thanh', icon: Headphones },
    { key: 'profile', label: 'Cá nhân', icon: User },
  ];

  return (
    <nav
      className={`fixed bottom-0 left-0 right-0 z-40 bg-[#F8F6F1]/95 dark:bg-[#101D35]/95 backdrop-blur-md border-t border-[#E8DED0] dark:border-white/10 transition-all duration-200 ${
        hasMiniPlayer ? 'pb-1' : 'pb-safe'
      }`}
      aria-label="Thanh điều hướng chính"
    >
      <div className="max-w-md mx-auto grid grid-cols-5 h-16 items-center px-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => onSelectTab(tab.key)}
              className="flex flex-col items-center justify-center min-h-[44px] min-w-[44px] py-1 text-center transition-all group"
            >
              <div
                className={`p-1 rounded-full transition-transform duration-200 ${
                  isActive ? 'scale-110' : 'group-hover:scale-105'
                }`}
              >
                <Icon
                  className={`w-5 h-5 transition-colors ${
                    isActive
                      ? 'text-[#B89650] dark:text-[#D8B878]'
                      : 'text-[#17202D]/60 dark:text-white/60 group-hover:text-[#17202D] dark:group-hover:text-white'
                  }`}
                  strokeWidth={isActive ? 2.3 : 1.7}
                />
              </div>
              <span
                className={`text-[11px] font-medium tracking-tight whitespace-nowrap transition-colors ${
                  isActive
                    ? 'text-[#B89650] dark:text-[#D8B878] font-semibold'
                    : 'text-[#17202D]/60 dark:text-white/60'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
