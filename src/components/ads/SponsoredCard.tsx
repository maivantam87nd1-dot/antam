import React from 'react';
import { ExternalLink, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SponsoredCardProps {
  title: string;
  sponsorName: string;
  description: string;
  actionText: string;
  actionUrl: string;
  badge?: string;
}

export const SponsoredCard: React.FC<SponsoredCardProps> = ({
  title,
  sponsorName,
  description,
  actionText,
  actionUrl,
  badge = 'Được tài trợ'
}) => {
  const { user, token } = useAuth();

  // Premium users are 100% ad-free as promised
  if (user?.isPremium) return null;

  const handleClick = async () => {
    try {
      await fetch('/api/ads/event', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          eventType: 'CLICK',
          adUnitId: `sponsor_${sponsorName.toLowerCase().replace(/\s+/g, '_')}`
        })
      });
    } catch (e) {}

    window.open(actionUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-[#D8B878]/10 via-[#F8F6F1] to-[#D8B878]/10 dark:from-white/5 dark:via-[#13223E] dark:to-white/5 border border-[#D8B878]/30 dark:border-white/10 my-4 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div className="space-y-1 max-w-xl">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded-md bg-[#B89650]/20 text-[#B89650] dark:text-[#D8B878] text-[10px] font-bold uppercase tracking-wider">
            {badge}
          </span>
          <span className="text-[11px] text-[#17202D]/60 dark:text-white/60">
            từ {sponsorName}
          </span>
        </div>
        <h4 className="font-serif text-sm sm:text-base font-bold text-[#101D35] dark:text-white">
          {title}
        </h4>
        <p className="text-xs text-[#17202D]/70 dark:text-white/70 leading-relaxed">
          {description}
        </p>
      </div>

      <button
        onClick={handleClick}
        className="px-4 py-2 rounded-xl bg-white dark:bg-white/10 border border-[#D8B878]/40 text-[#101D35] dark:text-white text-xs font-semibold hover:bg-[#D8B878]/20 transition-all flex items-center gap-1.5 shrink-0 min-h-[40px]"
      >
        <span>{actionText}</span>
        <ExternalLink className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
