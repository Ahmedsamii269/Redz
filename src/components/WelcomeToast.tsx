import React from 'react';
import { Sparkles, CheckCircle2, X } from 'lucide-react';
import { User } from '../types';

interface WelcomeToastProps {
  user: User | null;
  onClose: () => void;
}

export const WelcomeToast: React.FC<WelcomeToastProps> = ({ user, onClose }) => {
  if (!user) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[100] animate-in slide-in-from-right-10 fade-in duration-500">
      <div className="bg-slate-900 text-white rounded-2xl shadow-2xl border border-slate-700 p-5 pr-12 max-w-sm relative overflow-hidden group">
        {/* Animated background glow */}
        <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 bg-red-600/20 blur-3xl rounded-full group-hover:bg-red-600/30 transition-all duration-700"></div>
        
        <div className="flex items-start gap-4 relative z-10">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-600 to-rose-600 flex items-center justify-center shadow-lg shadow-red-500/20 shrink-0">
            <Sparkles className="w-6 h-6 text-white animate-pulse" />
          </div>
          
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm tracking-tight text-white">
                Welcome back, {user.fullName.split(' ')[0]}!
              </h3>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <p className="text-slate-400 text-xs mt-1 leading-relaxed">
              Authorized access granted. Your dashboard is updated with today's live pipeline.
            </p>
          </div>
        </div>

        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg hover:bg-slate-800 text-slate-500 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Bottom Progress Bar (Autohide indicator) */}
        <div className="absolute bottom-0 left-0 h-1 bg-red-600 animate-progress-shrink"></div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes progress-shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
        .animate-progress-shrink {
          animation: progress-shrink 5s linear forwards;
        }
      `}} />
    </div>
  );
};
