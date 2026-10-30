import React, { useState } from 'react';
import { X, ShieldCheck, Lock, Key, Check, Eye, EyeOff, AlertTriangle, Phone, MessageSquare } from 'lucide-react';
import { User } from '../types';
import { getStoredWhatsAppConfig, saveStoredWhatsAppConfig } from '../lib/whatsapp';

interface AdminSecurityModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onUpdateAdminCredentials: (newUsername: string, newPassword: string) => void;
  strictAuthMode: boolean;
  onToggleStrictAuth: (enabled: boolean) => void;
}

export const AdminSecurityModal: React.FC<AdminSecurityModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUpdateAdminCredentials,
  strictAuthMode,
  onToggleStrictAuth,
}) => {
  if (!isOpen) return null;

  const initialConfig = getStoredWhatsAppConfig();

  const [username, setUsername] = useState(currentUser?.username || 'Ahmedsamii');
  const [newPassword, setNewPassword] = useState(currentUser?.password || 'Ahmedsamii269#');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [voiceAcceptedPhone, setVoiceAcceptedPhone] = useState(initialConfig.voiceAcceptedPhone);
  const [upcomingInterviewPhone, setUpcomingInterviewPhone] = useState(initialConfig.upcomingInterviewPhone);

  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!username.trim()) {
      setErrorMessage('Please enter an admin username.');
      return;
    }
    if (!newPassword.trim()) {
      setErrorMessage('Please enter a new password.');
      return;
    }
    if (confirmPassword && newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-type accurately.');
      return;
    }

    // Save WhatsApp Target Numbers & Employee Names
    saveStoredWhatsAppConfig(
      voiceAcceptedPhone.trim() || '01012345678',
      'منسق مواعيد الانترفيو',
      upcomingInterviewPhone.trim() || '01012345678',
      'مسؤول الفيدباك والمتابعة'
    );

    onUpdateAdminCredentials(username.trim(), newPassword.trim());
    setSuccessMessage('Admin credentials & WhatsApp notification numbers updated successfully!');
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden text-left max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-red-600 shadow-2xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Security & Notification Settings</h3>
              <p className="text-xs text-slate-500">Ahmed Samii (Founder & CEO) account & WhatsApp routing</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs overflow-y-auto flex-1">
          {successMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-2 animate-in fade-in">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl flex items-center gap-2 animate-in fade-in">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* WhatsApp Notification Routing Section */}
          <div className="p-3.5 bg-emerald-50/80 border border-emerald-200 rounded-xl space-y-3">
            <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs">
              <MessageSquare className="w-4 h-4 text-emerald-600" />
              <span>أرقام الواتساب لإرسال بيانات الكانديدت (WhatsApp Routing Numbers)</span>
            </div>

            <div className="space-y-2">
              <div>
                <label className="block font-semibold text-emerald-950 mb-1">
                  1. رقم الواتساب لـ (قبول الفويس نوت Voice Note Accepted):
                </label>
                <input
                  type="tel"
                  value={voiceAcceptedPhone}
                  onChange={(e) => setVoiceAcceptedPhone(e.target.value)}
                  placeholder="010xxxxxxxx"
                  className="w-full p-2.5 rounded-lg border border-emerald-300 focus:ring-2 focus:ring-emerald-500 bg-white font-mono text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-emerald-950 mb-1">
                  2. رقم الواتساب لـ (تحديد المواعيد Upcoming Interview):
                </label>
                <input
                  type="tel"
                  value={upcomingInterviewPhone}
                  onChange={(e) => setUpcomingInterviewPhone(e.target.value)}
                  placeholder="010xxxxxxxx"
                  className="w-full p-2.5 rounded-lg border border-emerald-300 focus:ring-2 focus:ring-emerald-500 bg-white font-mono text-xs text-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Current credentials reminder */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-slate-600 space-y-1">
            <span className="font-bold text-slate-800 block text-xs">Configured CEO Credentials:</span>
            <div className="flex items-center justify-between font-mono text-[11px] text-slate-700">
              <span>Username: <strong className="text-red-700">Ahmedsamii</strong></span>
              <span>Password: <strong className="text-red-700">Ahmedsamii269#</strong></span>
            </div>
          </div>

          {/* Username */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">CEO Username</label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white font-mono text-xs"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">New Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full p-2.5 pr-10 rounded-lg border border-slate-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white font-mono text-xs"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-type new password to verify"
              className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white font-mono text-xs"
            />
          </div>

          {/* Strict Auth Mode Toggle */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <div>
              <span className="font-semibold text-slate-900 block">Strict Production Authentication</span>
              <p className="text-[11px] text-slate-500">
                Hides one-click account switcher pills so users must enter username & password manually.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer ml-3">
              <input
                type="checkbox"
                checked={strictAuthMode}
                onChange={(e) => onToggleStrictAuth(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
            </label>
          </div>

          {/* Buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold transition-all shadow-md"
            >
              Update Credentials & Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
