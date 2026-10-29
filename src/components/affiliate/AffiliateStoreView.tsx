import React, { useState } from 'react';
import { AFFILIATE_OFFERS } from '../../data/affiliateOffers';
import { AffiliateOffer } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { ExternalLink, ShoppingBag, ShieldCheck, Star, Info, Check, Filter } from 'lucide-react';

export const AffiliateStoreView: React.FC = () => {
  const { user, token } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [copiedNotification, setCopiedNotification] = useState<string | null>(null);

  const categories = [
    { id: 'all', label: 'Tất cả' },
    { id: 'gối_thiền', label: 'Gối & Đệm thiền' },
    { id: 'chuông_xoay', label: 'Chuông xoay & Âm thanh' },
    { id: 'tinh_dầu', label: 'Trầm hương & Không gian' },
    { id: 'sách_phật_học', label: 'Sách Chánh niệm' },
    { id: 'trang_phục_thiền', label: 'Ánh sáng thiền' },
  ];

  const filteredOffers = selectedCategory === 'all'
    ? AFFILIATE_OFFERS
    : AFFILIATE_OFFERS.filter(o => o.category === selectedCategory);

  const handleProductClick = async (offer: AffiliateOffer) => {
    // Record click event on server for real analytics (no fake numbers)
    try {
      await fetch('/api/affiliate/click', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          offerId: offer.id,
          sourceScreen: 'affiliate_store_view'
        })
      });
    } catch (e) {
      // Non-blocking
    }

    // Open verified partner product page
    window.open(offer.affiliateUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 pb-32">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-8 space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#D8B878]/15 border border-[#D8B878]/30 text-xs font-semibold text-[#B89650] dark:text-[#D8B878]">
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>GÓC AN TÂM · VẬT PHẨM CHÁNH NIỆM</span>
        </div>
        <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#101D35] dark:text-white">
          Sản phẩm hỗ trợ Không gian Thiền & Thư giãn
        </h1>
        <p className="text-xs sm:text-sm text-[#17202D]/70 dark:text-white/70 leading-relaxed">
          Được tuyển chọn kỹ lưỡng từ các đối tác uy tín, giúp trợ duyên cho tư thế ngồi vững chãi, nuôi dưỡng sự tĩnh lặng và hơi thở an lạc trong đời sống thường nhật.
        </p>

        {/* Ethical Transparency Box */}
        <div className="mt-4 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-left flex items-start gap-3">
          <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <p className="text-[11px] sm:text-xs text-amber-800 dark:text-amber-200/90 leading-relaxed">
            <strong>Minh bạch Tiếp thị Liên kết (Affiliate Disclosure):</strong> AN TÂM có thể nhận một khoản hoa hồng giới thiệu nhỏ khi bạn mua hàng qua các đường dẫn dưới đây. Điều này hoàn toàn không làm tăng chi phí của bạn và giúp chúng tôi duy trì nội dung thiền miễn phí cho cộng đồng.
          </p>
        </div>
      </div>

      {/* Category Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-none mb-6">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 rounded-2xl text-xs font-medium whitespace-nowrap transition-all min-h-[40px] flex items-center gap-1.5 ${
              selectedCategory === cat.id
                ? 'bg-[#101D35] dark:bg-[#D8B878] text-white dark:text-[#101D35] shadow-sm font-semibold'
                : 'bg-white/70 dark:bg-white/5 border border-[#E8DED0] dark:border-white/10 text-[#17202D]/70 dark:text-white/70 hover:bg-white dark:hover:bg-white/10'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredOffers.map((offer) => (
          <div
            key={offer.id}
            className="rounded-3xl bg-white dark:bg-[#13223E] border border-[#E8DED0] dark:border-white/10 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              {/* Product Image */}
              <div className="relative h-48 overflow-hidden bg-black/5">
                <img
                  src={offer.imageUrl}
                  alt={offer.title}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <span className="absolute top-3 left-3 px-2.5 py-1 rounded-xl bg-black/60 backdrop-blur-md text-[10px] text-white font-medium">
                  {offer.categoryLabel}
                </span>
                {offer.rating && (
                  <span className="absolute top-3 right-3 px-2 py-0.5 rounded-xl bg-amber-500/90 text-white text-[11px] font-bold flex items-center gap-1 shadow-sm">
                    <Star className="w-3 h-3 fill-current" />
                    <span>{offer.rating}</span>
                  </span>
                )}
              </div>

              {/* Product Details */}
              <div className="p-5 space-y-3">
                <div className="text-[11px] text-[#B89650] dark:text-[#D8B878] font-semibold flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{offer.partnerName}</span>
                </div>

                <h3 className="font-serif text-base sm:text-lg font-bold text-[#101D35] dark:text-white leading-snug line-clamp-2">
                  {offer.title}
                </h3>

                <p className="text-xs text-[#17202D]/70 dark:text-white/70 leading-relaxed line-clamp-3">
                  {offer.description}
                </p>

                {/* Key Features List */}
                <div className="space-y-1.5 pt-1">
                  {offer.features.map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-[11px] text-[#17202D]/80 dark:text-white/80">
                      <Check className="w-3 h-3 text-[#B89650] dark:text-[#D8B878] shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Price & Action Button */}
            <div className="p-5 pt-0 border-t border-[#E8DED0]/50 dark:border-white/5 mt-4">
              <div className="flex items-center justify-between pt-4">
                <div>
                  <span className="text-[10px] text-[#17202D]/50 dark:text-white/50 block">Giá tham khảo</span>
                  <span className="font-mono text-lg font-bold text-[#101D35] dark:text-white">
                    {offer.formattedPrice}
                  </span>
                </div>

                <button
                  onClick={() => handleProductClick(offer)}
                  className="px-4 py-2.5 rounded-2xl bg-[#101D35] dark:bg-[#D8B878] text-white dark:text-[#101D35] text-xs font-semibold hover:opacity-95 transition-all flex items-center gap-1.5 min-h-[44px]"
                >
                  <span>Xem tại đối tác</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>

              <span className="block text-[10px] text-[#17202D]/40 dark:text-white/40 pt-2 text-center">
                Mở liên kết đối tác chính thức được chứng nhận
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
