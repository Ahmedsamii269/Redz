import React, { useEffect, useState } from 'react';
import { CheckCircle2, AlertTriangle, Info, X, Cloud, Database } from 'lucide-react';
import { subscribeToToasts, removeToast, ToastItem } from '../lib/toast';

export const ToastContainer: React.FC = () => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    const unsubscribe = subscribeToToasts(setToasts);
    return unsubscribe;
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="fixed bottom-5 right-5 z-[120] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-3 sm:px-0"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto relative overflow-hidden rounded-xl p-3.5 shadow-xl border backdrop-blur-md transition-all duration-300 animate-in slide-in-from-bottom-5 fade-in flex items-start gap-3 ${
            toast.type === 'success'
              ? 'bg-emerald-950/90 text-emerald-50 border-emerald-700/60 shadow-emerald-950/20'
              : toast.type === 'error'
              ? 'bg-rose-950/90 text-rose-50 border-rose-700/60 shadow-rose-950/20'
              : 'bg-slate-900/90 text-slate-50 border-slate-700/60 shadow-slate-950/20'
          }`}
        >
          {/* Toast Icon */}
          <div
            className={`p-2 rounded-lg shrink-0 mt-0.5 ${
              toast.type === 'success'
                ? 'bg-emerald-500/20 text-emerald-400'
                : toast.type === 'error'
                ? 'bg-rose-500/20 text-rose-400'
                : 'bg-blue-500/20 text-blue-400'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : toast.type === 'error' ? (
              <AlertTriangle className="w-4 h-4" />
            ) : (
              <Info className="w-4 h-4" />
            )}
          </div>

          {/* Toast Content */}
          <div className="flex-1 min-w-0 pr-6">
            <div className="flex items-center gap-1.5">
              {toast.title && (
                <span className="font-bold text-xs tracking-tight uppercase opacity-90">
                  {toast.title}
                </span>
              )}
              {toast.title && (
                <span className="text-[10px] opacity-40">•</span>
              )}
              <span className="text-[11px] opacity-75 font-mono flex items-center gap-1">
                <Cloud className="w-3 h-3 inline" /> Firestore
              </span>
            </div>
            <p className="text-xs font-semibold mt-0.5 leading-snug">
              {toast.message}
            </p>
          </div>

          {/* Dismiss Button */}
          <button
            onClick={() => removeToast(toast.id)}
            className="absolute top-3 right-3 p-1 rounded-md text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Dismiss"
          >
            <X className="w-3.5 h-3.5" />
          </button>

          {/* Animated Progress Bar */}
          {toast.durationMs && toast.durationMs > 0 && (
            <div
              className={`absolute bottom-0 left-0 h-0.5 ${
                toast.type === 'success'
                  ? 'bg-emerald-400'
                  : toast.type === 'error'
                  ? 'bg-rose-400'
                  : 'bg-blue-400'
              }`}
              style={{
                animation: `toast-progress ${toast.durationMs}ms linear forwards`,
              }}
            />
          )}
        </div>
      ))}

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes toast-progress {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}} />
    </div>
  );
};
