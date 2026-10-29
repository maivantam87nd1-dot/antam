import React from 'react';
import { TabKey } from './TabBar';
import { Sparkles, Moon, Sun } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface DesktopHeaderProps {
  currentTab: TabKey;
  onSelectTab: (tab: TabKey) => void;
  onOpenAI: () => void;
  onQuickPractice: () => void;
}

export const DesktopHeader: React.FC<DesktopHeaderProps> = ({
  currentTab,
  onSelectTab,
  onOpenAI,
  onQuickPractice,
}) => {
  const { user, toggleTheme } = useAuth();

  return (
    <header className="sticky top-0 z-30 w-full bg-[#F8F6F1]/90 dark:bg-[#101D35]/90 backdrop-blur-md border-b border-[#E8DED0] dark:border-white/10 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand title, one line */}
        <div
          onClick={() => onSelectTab('home')}
          className="cursor-pointer flex items-center gap-2.5 whitespace-nowrap shrink-0 group"
        >
          <div className="w-8 h-8 rounded-full bg-[#D8B878]/20 dark:bg-[#D8B878]/25 flex items-center justify-center text-[#B89650] dark:text-[#D8B878] group-hover:scale-105 transition-transform">
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" aria-hidden="true">
              <path d="M12 2C12 2 8 8 8 13C8 16.5 10 19 12 21C14 19 16 16.5 16 13C16 8 12 2 12 2Z" opacity="0.6"/>
              <path d="M12 7C9.5 7 5 11 5 15C5 18 7.5 20.5 12 21C16.5 20.5 19 18 19 15C19 11 14.5 7 12 7Z"/>
            </svg>
          </div>
          <span className="font-serif text-xl font-bold tracking-wider text-[#101D35] dark:text-[#F5F7FA]">
            AN TÂM
          </span>
        </div>

        {/* Zone 2: 4-5 nav links, 1-2 word labels, single-line */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium">
          <button
            onClick={() => onSelectTab('home')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 border-b-2 ${
              currentTab === 'home'
                ? 'border-[#B89650] dark:border-[#D8B878] text-[#101D35] dark:text-white font-semibold'
                : 'border-transparent text-[#17202D]/70 dark:text-white/70 hover:text-[#101D35] dark:hover:text-white'
            }`}
          >
            Trang chủ
          </button>
          <button
            onClick={() => onSelectTab('meditation')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 border-b-2 ${
              currentTab === 'meditation'
                ? 'border-[#B89650] dark:border-[#D8B878] text-[#101D35] dark:text-white font-semibold'
                : 'border-transparent text-[#17202D]/70 dark:text-white/70 hover:text-[#101D35] dark:hover:text-white'
            }`}
          >
            Thiền & Thở
          </button>
          <button
            onClick={() => onSelectTab('buddhist')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 border-b-2 ${
              currentTab === 'buddhist'
                ? 'border-[#B89650] dark:border-[#D8B878] text-[#101D35] dark:text-white font-semibold'
                : 'border-transparent text-[#17202D]/70 dark:text-white/70 hover:text-[#101D35] dark:hover:text-white'
            }`}
          >
            Phật pháp
          </button>
          <button
            onClick={() => onSelectTab('sound')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 border-b-2 ${
              currentTab === 'sound'
                ? 'border-[#B89650] dark:border-[#D8B878] text-[#101D35] dark:text-white font-semibold'
                : 'border-transparent text-[#17202D]/70 dark:text-white/70 hover:text-[#101D35] dark:hover:text-white'
            }`}
          >
            Âm thanh
          </button>
          <button
            onClick={() => onSelectTab('profile')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 border-b-2 ${
              currentTab === 'profile'
                ? 'border-[#B89650] dark:border-[#D8B878] text-[#101D35] dark:text-white font-semibold'
                : 'border-transparent text-[#17202D]/70 dark:text-white/70 hover:text-[#101D35] dark:hover:text-white'
            }`}
          >
            Cá nhân
          </button>
        </nav>

        {/* Zone 3: 1 primary action (+ Theme toggle) */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={toggleTheme}
            className="min-h-[44px] min-w-[44px] p-2.5 rounded-full text-[#17202D]/70 dark:text-white/70 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            title="Đổi giao diện Sáng / Tối"
            aria-label="Đổi giao diện"
          >
            {user?.theme === 'dark' ? <Sun className="w-4 h-4 text-[#D8B878]" /> : <Moon className="w-4 h-4 text-[#101D35]" />}
          </button>

          <button
            onClick={onOpenAI}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-[#101D35] dark:text-[#F5F7FA] bg-[#D8B878]/25 dark:bg-[#D8B878]/20 hover:bg-[#D8B878]/35 dark:hover:bg-[#D8B878]/30 rounded-xl transition-all whitespace-nowrap shrink-0 min-h-[44px]"
            title="Trợ lý AI An Tâm"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#B89650] dark:text-[#D8B878]" />
            <span>AI An Tâm</span>
          </button>

          <button
            onClick={onQuickPractice}
            className="hidden sm:inline-flex items-center justify-center px-4 py-2 text-xs font-semibold text-white bg-[#101D35] dark:bg-[#D8B878] dark:text-[#101D35] hover:bg-[#172644] dark:hover:bg-[#e4ca94] rounded-xl shadow-sm transition-all whitespace-nowrap shrink-0 min-h-[44px]"
          >
            Bắt đầu 3 phút
          </button>
        </div>
      </div>
    </header>
  );
};
