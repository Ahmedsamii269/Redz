import React, { useState } from 'react';
import { Lock, User as UserIcon, LogIn, AlertCircle, Sparkles, RefreshCw } from 'lucide-react';
import { User } from '../types';
import { loginUser } from '../lib/storage';
import { RedzLogo } from './RedzLogo';

interface LoginModalProps {
  isOpen: boolean;
  onClose?: () => void;
  onLoginSuccess: (user: User) => void;
  recruiters: User[];
  strictAuthMode?: boolean;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  recruiters,
  strictAuthMode = false,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoggingIn(true);

    try {
      const res = await loginUser(username, password);
      if (res.success && res.user) {
        onLoginSuccess(res.user);
        if (onClose) onClose();
      } else {
        setErrorMessage(res.error || 'Sign in failed. Please check your credentials.');
      }
    } catch (err) {
      setErrorMessage('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Brand Banner */}
        <div className="p-6 bg-slate-900 text-white text-center flex flex-col items-center">
          <RedzLogo size="lg" variant="horizontal" theme="dark" showSubtitle={true} />
          <p className="text-xs text-slate-300 mt-3">
            Recruitment Agency Portal · Authorized Sign In
          </p>
        </div>

        {/* Login Form */}
        <div className="p-6 space-y-4 text-xs text-left">
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Username or Email
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Ahmedsamii269 or recruiter username"
                  className="w-full p-2.5 pl-8 rounded-lg border border-slate-300 focus:ring-2 focus:ring-red-500 bg-white"
                />
                <UserIcon className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3" />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full p-2.5 pl-8 rounded-lg border border-slate-300 focus:ring-2 focus:ring-red-500 bg-white font-mono"
                />
                <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors shadow-xs flex items-center justify-center gap-1.5 text-xs disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoggingIn ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <LogIn className="w-3.5 h-3.5" />
              )}
              <span>{isLoggingIn ? 'Signing In...' : 'Sign In'}</span>
            </button>
          </form>

          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase">
              <span className="bg-white px-2 text-slate-400">Or Admin Quick Access</span>
            </div>
          </div>

          <button
            onClick={async () => {
              setErrorMessage(null);
              setIsLoggingIn(true);
              try {
                const { signInWithGoogle } = await import('../lib/firebase');
                const fbUser = await signInWithGoogle();
                
                if (fbUser && fbUser.email) {
                  const userEmail = fbUser.email.trim().toLowerCase();
                  
                  // 1. Direct match with existing recruiter list by email
                  let matchingRecruiter = recruiters.find(
                    (r) => r.email && r.email.trim().toLowerCase() === userEmail
                  );

                  // 2. Special handling for Founder / CEO (Ahmed Samii)
                  if (!matchingRecruiter && (userEmail === 'ahmedsamii269@gmail.com' || userEmail.includes('ahmedsamii'))) {
                    matchingRecruiter = recruiters.find((r) => r.role === 'admin') || {
                      id: 'admin-ahmed-fresh',
                      username: 'Ahmedsamii',
                      fullName: fbUser.displayName || 'Ahmed Samii (Founder & CEO)',
                      role: 'admin',
                      email: userEmail,
                      phone: '01012345678',
                      referralCode: 'ceo_ahmed',
                      active: true,
                      allowGoogleLogin: true,
                      createdAt: new Date().toISOString(),
                    };
                  }

                  // 3. Fallback: If no recruiter linked yet, automatically provision recruiter access
                  if (!matchingRecruiter) {
                    const defaultUsername = userEmail.split('@')[0].replace(/[^a-z0-9_]/g, '_');
                    matchingRecruiter = {
                      id: `rec-${Date.now()}`,
                      username: defaultUsername,
                      fullName: fbUser.displayName || defaultUsername,
                      role: 'recruiter',
                      email: userEmail,
                      phone: '',
                      referralCode: `rec_${defaultUsername}`,
                      active: true,
                      allowGoogleLogin: true,
                      createdAt: new Date().toISOString(),
                    };
                  }

                  // Save user session and log in
                  const { setCurrentUser } = await import('../lib/storage');
                  setCurrentUser(matchingRecruiter);
                  onLoginSuccess(matchingRecruiter);
                  if (onClose) onClose();
                } else {
                  setErrorMessage('Google Sign-In was cancelled or did not return an email.');
                }
              } catch (err: any) {
                console.error('Google Sign-In Error:', err);
                setErrorMessage('Google Sign-In failed or popup was closed. Please try again.');
              } finally {
                setIsLoggingIn(false);
              }
            }}
            disabled={isLoggingIn}
            className="w-full py-2.5 px-4 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 text-xs disabled:opacity-70 cursor-pointer"
          >
            <img src="https://www.google.com/favicon.ico" className="w-3.5 h-3.5" alt="Google" />
            <span>Sign in with Google</span>
          </button>
        </div>
      </div>
    </div>
  );
};
