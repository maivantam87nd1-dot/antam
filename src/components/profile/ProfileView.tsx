import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { soundEngine } from '../../services/soundEngine';
import {
  User,
  Crown,
  Bell,
  Moon,
  Sun,
  Shield,
  Download,
  Trash2,
  LogOut,
  Sparkles,
  Check,
  LayoutDashboard,
  Mail,
  Lock,
  KeyRound,
  AlertCircle
} from 'lucide-react';

interface ProfileViewProps {
  onOpenAdmin: () => void;
  onOpenSubscription: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ onOpenAdmin, onOpenSubscription }) => {
  const {
    user,
    token,
    loginWithPassword,
    register,
    logout,
    updateProfile,
    deleteAccount,
    exportUserData,
    toggleTheme
  } = useAuth();

  // Auth form modal
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [exportNotice, setExportNotice] = useState('');

  // Change password modal state
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [changePasswordMsg, setChangePasswordMsg] = useState('');
  const [changePasswordError, setChangePasswordError] = useState('');

  const handleTestBell = () => {
    soundEngine.playSingingBowl(216, 6.0, 0.7);
    soundEngine.triggerHaptic([50, 30, 50]);
  };

  const handleExportData = async () => {
    const data = await exportUserData();
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `antam_data_export_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    setExportNotice('Đã xuất dữ liệu cá nhân thành công!');
    setTimeout(() => setExportNotice(''), 3000);
  };

  const handleToggleBellTime = (time: string) => {
    if (!user) return;
    const currentTimes = user.mindfulnessBell?.times || [];
    const nextTimes = currentTimes.includes(time)
      ? currentTimes.filter(t => t !== time)
      : [...currentTimes, time];
    updateProfile({
      mindfulnessBell: {
        ...user.mindfulnessBell,
        times: nextTimes
      }
    });
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setIsSubmitting(true);

    if (authMode === 'login') {
      const res = await loginWithPassword(emailInput.trim(), passwordInput);
      if (res.success) {
        setShowAuthModal(false);
        setPasswordInput('');
      } else {
        setAuthError(res.error || 'Đăng nhập không thành công.');
      }
    } else {
      const res = await register(emailInput.trim(), passwordInput, nameInput.trim());
      if (res.success) {
        setShowAuthModal(false);
        setPasswordInput('');
      } else {
        setAuthError(res.error || 'Đăng ký không thành công.');
      }
    }
    setIsSubmitting(false);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangePasswordError('');
    setChangePasswordMsg('');
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      const data = await res.json();
      if (!res.ok) {
        setChangePasswordError(data.error || 'Đổi mật khẩu thất bại.');
        return;
      }
      setChangePasswordMsg(data.message || 'Đổi mật khẩu thành công!');
      setCurrentPassword('');
      setNewPassword('');
      setTimeout(() => setShowChangePasswordModal(false), 2000);
    } catch (e: any) {
      setChangePasswordError('Lỗi kết nối máy chủ.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 pb-28 space-y-6">
      {/* User Info Card */}
      <div className="p-6 rounded-3xl bg-white/80 dark:bg-white/5 border border-[#E8DED0] dark:border-white/10 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-[#101D35] to-[#D8B878] text-white flex items-center justify-center font-serif text-2xl font-bold shadow-md">
            {user?.name ? user.name[0].toUpperCase() : 'A'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-serif text-xl font-bold text-[#101D35] dark:text-white">
                {user?.name || 'Khách An Lạc'}
              </h2>
              {user?.isPremium && (
                <span className="px-2 py-0.5 rounded-full bg-[#D8B878] text-[#101D35] text-[10px] font-bold flex items-center gap-1 shadow-sm">
                  <Crown className="w-3 h-3 fill-current" />
                  <span>PREMIUM</span>
                </span>
              )}
            </div>
            <p className="text-xs text-[#17202D]/60 dark:text-white/60">
              {user?.isGuest ? 'Đang trải nghiệm chế độ Khách' : user?.email}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {user?.isGuest ? (
            <button
              onClick={() => {
                setAuthMode('login');
                setShowAuthModal(true);
              }}
              className="px-4 py-2 rounded-xl bg-[#101D35] dark:bg-[#D8B878] text-white dark:text-[#101D35] text-xs font-semibold flex items-center gap-1.5 min-h-[40px]"
            >
              <KeyRound className="w-4 h-4" />
              <span>Đăng nhập / Đăng ký</span>
            </button>
          ) : (
            <>
              {user?.role === 'super_admin' && (
                <button
                  onClick={onOpenAdmin}
                  className="px-3.5 py-2 rounded-xl bg-[#101D35] text-white dark:bg-[#D8B878] dark:text-[#101D35] text-xs font-semibold flex items-center gap-1.5 min-h-[40px]"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Quản trị CMS</span>
                </button>
              )}

              <button
                onClick={logout}
                className="p-2.5 rounded-xl bg-black/5 dark:bg-white/10 text-[#17202D]/70 dark:text-white/70 hover:text-rose-500 transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
                title="Đăng xuất"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Premium Status Banner */}
      {!user?.isPremium ? (
        <div className="relative overflow-hidden p-6 rounded-3xl bg-gradient-to-r from-[#101D35] via-[#172644] to-[#101D35] text-white border border-[#D8B878]/30 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="max-w-md">
            <span className="text-xs font-semibold text-[#D8B878] uppercase tracking-wider block mb-1">
              Gói Hội Viên AN TÂM Premium
            </span>
            <h3 className="font-serif text-xl font-bold mb-1">
              Mở Khóa Toàn Bộ Kho Tàng Tâm Thức
            </h3>
            <p className="text-xs text-white/80 leading-relaxed">
              Truy cập không giới hạn 100+ bài thiền chuyên sâu, âm thanh phối đa tầng, tải offline và trợ lý AI không giới hạn.
            </p>
          </div>

          <button
            onClick={onOpenSubscription}
            className="px-6 py-3 rounded-2xl bg-[#D8B878] hover:bg-[#c9a762] text-[#101D35] font-bold text-xs shadow-lg active:scale-95 transition-all whitespace-nowrap min-h-[44px]"
          >
            Khám phá gói Premium
          </button>
        </div>
      ) : (
        <div className="p-4 rounded-2xl bg-[#D8B878]/15 border border-[#D8B878]/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-[#B89650] dark:text-[#D8B878]" />
            <span className="text-xs font-bold text-[#101D35] dark:text-white">
              Gói Premium đang hoạt động · Đã xác thực biên lai hợp lệ
            </span>
          </div>
          <span className="text-xs text-[#B89650] dark:text-[#D8B878] font-medium">
            Tự động gia hạn
          </span>
        </div>
      )}

      {/* Mindfulness Bell Settings */}
      <div className="p-6 rounded-3xl bg-white/80 dark:bg-white/5 border border-[#E8DED0] dark:border-white/10 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-[#B89650] dark:text-[#D8B878]" />
            <div>
              <h3 className="font-serif text-base font-bold text-[#101D35] dark:text-white">
                Chuông Chánh Niệm Tự Động
              </h3>
              <p className="text-xs text-[#17202D]/60 dark:text-white/60">
                Nhắc nhở bạn tạm dừng công việc một phút để hít thở bình an
              </p>
            </div>
          </div>

          <button
            onClick={handleTestBell}
            className="px-3 py-1.5 rounded-xl bg-black/5 dark:bg-white/10 text-xs font-medium text-[#17202D]/70 dark:text-white/70 hover:text-[#101D35] transition-colors min-h-[36px]"
          >
            Thử tiếng chuông
          </button>
        </div>

        {/* Bell Time Checkboxes */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
          {[
            { time: '08:00', label: '08:00 · Chào ngày mới' },
            { time: '12:00', label: '12:00 · Một phút thở chậm' },
            { time: '18:00', label: '18:00 · Thư giãn sau giờ làm' },
            { time: '21:00', label: '21:00 · Buông bỏ lo lắng' },
          ].map((item) => {
            const isChecked = user?.mindfulnessBell?.times?.includes(item.time);
            return (
              <button
                key={item.time}
                onClick={() => handleToggleBellTime(item.time)}
                className={`p-3 rounded-2xl border text-left text-xs transition-all flex items-center justify-between min-h-[44px] ${
                  isChecked
                    ? 'border-[#D8B878] bg-[#D8B878]/10 text-[#101D35] dark:text-white font-semibold'
                    : 'border-[#E8DED0] dark:border-white/10 bg-transparent text-[#17202D]/60 dark:text-white/60'
                }`}
              >
                <span>{item.label}</span>
                {isChecked && <Check className="w-4 h-4 text-[#B89650] dark:text-[#D8B878]" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* General Settings: Theme, Privacy & Account Actions */}
      <div className="p-6 rounded-3xl bg-white/80 dark:bg-white/5 border border-[#E8DED0] dark:border-white/10 space-y-4">
        <h3 className="font-serif text-base font-bold text-[#101D35] dark:text-white">
          Cài Đặt & Quyền Riêng Tư
        </h3>

        <div className="divide-y divide-[#E8DED0]/60 dark:divide-white/10 text-xs">
          {/* Theme switcher */}
          <div className="py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {user?.theme === 'dark' ? <Moon className="w-4 h-4 text-[#D8B878]" /> : <Sun className="w-4 h-4 text-[#101D35]" />}
              <span className="font-medium text-[#17202D] dark:text-white">Giao diện Sáng / Tối</span>
            </div>
            <button
              onClick={toggleTheme}
              className="px-3 py-1.5 rounded-xl bg-black/5 dark:bg-white/10 text-xs font-semibold min-h-[36px]"
            >
              {user?.theme === 'dark' ? 'Đang dùng nền Tối' : 'Đang dùng nền Sáng'}
            </button>
          </div>

          {/* Export Data */}
          <div className="py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Download className="w-4 h-4 text-[#B89650]" />
              <div>
                <span className="font-medium text-[#17202D] dark:text-white block">Xuất toàn bộ dữ liệu</span>
                <span className="text-[11px] text-[#17202D]/50 dark:text-white/50">Tải về máy toàn bộ nhật ký, tiến độ và lịch sử (JSON)</span>
              </div>
            </div>
            <button
              onClick={handleExportData}
              className="px-3 py-1.5 rounded-xl bg-black/5 dark:bg-white/10 text-xs font-medium hover:text-[#101D35] min-h-[36px]"
            >
              Tải tệp JSON
            </button>
          </div>

          {/* Change Password for registered users */}
          {!user?.isGuest && (
            <div className="py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#B89650]" />
                <div>
                  <span className="font-medium text-[#17202D] dark:text-white block">Mật khẩu bảo vệ</span>
                  <span className="text-[11px] text-[#17202D]/50 dark:text-white/50">Cập nhật mật khẩu đăng nhập an toàn</span>
                </div>
              </div>
              <button
                onClick={() => {
                  setChangePasswordError('');
                  setChangePasswordMsg('');
                  setShowChangePasswordModal(true);
                }}
                className="px-3 py-1.5 rounded-xl bg-black/5 dark:bg-white/10 text-xs font-medium hover:text-[#101D35] min-h-[36px]"
              >
                Đổi mật khẩu
              </button>
            </div>
          )}

          {/* Delete Account */}
          <div className="py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trash2 className="w-4 h-4 text-rose-500" />
              <div>
                <span className="font-medium text-rose-600 dark:text-rose-400 block">Xóa tài khoản vĩnh viễn</span>
                <span className="text-[11px] text-[#17202D]/50 dark:text-white/50">Xóa mọi dữ liệu cá nhân theo quy định bảo mật</span>
              </div>
            </div>
            <button
              onClick={() => {
                if (window.confirm('Bạn có chắc chắn muốn xóa toàn bộ dữ liệu và tài khoản của mình? Thao tác này không thể hoàn tác.')) {
                  deleteAccount();
                }
              }}
              className="px-3 py-1.5 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 font-semibold hover:bg-rose-500/20 transition-colors min-h-[36px]"
            >
              Xóa tài khoản
            </button>
          </div>
        </div>

        {exportNotice && (
          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium text-center pt-2">
            {exportNotice}
          </p>
        )}
      </div>

      {/* Login / Register Modal */}
      {showAuthModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md bg-[#F8F6F1] dark:bg-[#101D35] text-[#17202D] dark:text-[#F5F7FA] rounded-3xl p-6 shadow-2xl border border-[#D8B878]/30 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#E8DED0] dark:border-white/10">
              <h3 className="font-serif text-lg font-bold text-[#101D35] dark:text-white">
                {authMode === 'login' ? 'Đăng Nhập Tài Khoản' : 'Đăng Ký Tài Khoản Mới'}
              </h3>
              <button
                onClick={() => setShowAuthModal(false)}
                className="p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/10"
              >
                <span className="text-lg">✕</span>
              </button>
            </div>

            <form onSubmit={handleAuthSubmit} className="space-y-3">
              {authMode === 'register' && (
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#17202D]/70 dark:text-white/70">Họ và tên</label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Tuệ An"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-black/20 border border-[#E8DED0] dark:border-white/10 text-xs focus:outline-none focus:border-[#D8B878]"
                  />
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#17202D]/70 dark:text-white/70">Địa chỉ Email</label>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-black/20 border border-[#E8DED0] dark:border-white/10 text-xs focus:outline-none focus:border-[#D8B878]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#17202D]/70 dark:text-white/70">Mật khẩu</label>
                <input
                  type="password"
                  required
                  placeholder="Ít nhất 6 ký tự"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-black/20 border border-[#E8DED0] dark:border-white/10 text-xs focus:outline-none focus:border-[#D8B878]"
                />
              </div>

              {authError && (
                <div className="p-3 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-1.5 border border-rose-500/20">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-2xl bg-[#101D35] dark:bg-[#D8B878] text-white dark:text-[#101D35] text-xs font-semibold shadow-md hover:opacity-95 disabled:opacity-50 transition-opacity min-h-[44px]"
              >
                {isSubmitting
                  ? 'Đang xử lý...'
                  : authMode === 'login'
                  ? 'Đăng nhập'
                  : 'Hoàn tất đăng ký'}
              </button>
            </form>

            <div className="text-center text-xs text-[#17202D]/60 dark:text-white/60 pt-2 border-t border-[#E8DED0]/50 dark:border-white/10">
              {authMode === 'login' ? (
                <p>
                  Chưa có tài khoản?{' '}
                  <button
                    onClick={() => {
                      setAuthMode('register');
                      setAuthError('');
                    }}
                    className="font-bold text-[#B89650] dark:text-[#D8B878] hover:underline"
                  >
                    Đăng ký ngay
                  </button>
                </p>
              ) : (
                <p>
                  Đã có tài khoản?{' '}
                  <button
                    onClick={() => {
                      setAuthMode('login');
                      setAuthError('');
                    }}
                    className="font-bold text-[#B89650] dark:text-[#D8B878] hover:underline"
                  >
                    Đăng nhập
                  </button>
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showChangePasswordModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md bg-[#F8F6F1] dark:bg-[#101D35] text-[#17202D] dark:text-[#F5F7FA] rounded-3xl p-6 shadow-2xl border border-[#D8B878]/30 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#E8DED0] dark:border-white/10">
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-[#B89650] dark:text-[#D8B878]" />
                <h3 className="font-serif text-lg font-bold text-[#101D35] dark:text-white">
                  Đổi Mật Khẩu
                </h3>
              </div>
              <button
                onClick={() => setShowChangePasswordModal(false)}
                className="p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/10"
              >
                <span className="text-lg">✕</span>
              </button>
            </div>
            <form onSubmit={handleChangePassword} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#17202D]/70 dark:text-white/70">Mật khẩu hiện tại</label>
                <input
                  type="password"
                  required
                  placeholder="Nhập mật khẩu đang dùng"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-black/20 border border-[#E8DED0] dark:border-white/10 text-xs focus:outline-none focus:border-[#D8B878]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#17202D]/70 dark:text-white/70">Mật khẩu mới</label>
                <input
                  type="password"
                  required
                  placeholder="Ít nhất 6 ký tự"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-black/20 border border-[#E8DED0] dark:border-white/10 text-xs focus:outline-none focus:border-[#D8B878]"
                />
              </div>
              {changePasswordError && (
                <div className="p-3 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-1.5 border border-rose-500/20">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{changePasswordError}</span>
                </div>
              )}
              {changePasswordMsg && (
                <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-1.5 border border-emerald-500/20">
                  <span>✓ {changePasswordMsg}</span>
                </div>
              )}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-2xl bg-[#101D35] dark:bg-[#D8B878] text-white dark:text-[#101D35] text-xs font-semibold shadow-md hover:opacity-95 disabled:opacity-50 transition-opacity min-h-[44px]"
              >
                {isSubmitting ? 'Đang cập nhật...' : 'Xác nhận đổi mật khẩu'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
