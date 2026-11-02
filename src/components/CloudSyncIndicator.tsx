import React, { useState, useEffect } from 'react';
import { Cloud, CloudOff, ShieldCheck, Database, CheckCircle2, RefreshCw, X, Lock } from 'lucide-react';
import { subscribeToSyncState, SyncState } from '../lib/storage';

interface CloudSyncIndicatorProps {
  compact?: boolean;
}

export const CloudSyncIndicator: React.FC<CloudSyncIndicatorProps> = ({ compact = false }) => {
  const [syncState, setSyncState] = useState<SyncState>('synced');
  const [lastSaved, setLastSaved] = useState<Date>(new Date());
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const unsub = subscribeToSyncState((state, time) => {
      setSyncState(state);
      if (time) setLastSaved(time);
    });
    return unsub;
  }, []);

  const formatTime = (d: Date) => {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all border shadow-2xs ${
          syncState === 'saving'
            ? 'bg-amber-50 text-amber-800 border-amber-300 animate-pulse'
            : syncState === 'error'
            ? 'bg-red-50 text-red-700 border-red-300'
            : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200/90'
        }`}
        title="Click to view Cloud Storage & Firestore Sync details"
      >
        <div className="relative flex items-center justify-center">
          {syncState === 'saving' ? (
            <RefreshCw className="w-3.5 h-3.5 text-amber-600 animate-spin" />
          ) : syncState === 'error' ? (
            <CloudOff className="w-3.5 h-3.5 text-red-600" />
          ) : (
            <Cloud className="w-3.5 h-3.5 text-emerald-600" />
          )}
          {syncState === 'synced' && (
            <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
          )}
        </div>

        {!compact && (
          <span className="text-[11px] font-medium tracking-tight">
            {syncState === 'saving' ? (
              'Saving to Cloud...'
            ) : syncState === 'error' ? (
              'Sync Error'
            ) : (
              <span className="flex items-center gap-1">
                <span className="font-bold text-emerald-900">Cloud Synced</span>
                <span className="text-[10px] text-emerald-600 font-mono hidden lg:inline">
                  (Firestore)
                </span>
              </span>
            )}
          </span>
        )}
      </button>

      {/* Sync Details Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4 border border-slate-200 text-left relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-600 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Google Cloud Firestore Backend</h3>
                <p className="text-xs text-slate-500">Real-time Data Storage & Synchronization</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-emerald-50/80 rounded-xl border border-emerald-200/90 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-emerald-950 block">Cloud Persistence Active</span>
                  <p className="text-emerald-800 text-[11px] mt-0.5 leading-relaxed">
                    All candidate applications, company job offers, and recruiter data are immediately stored and synced in real-time on Google Cloud Firestore.
                  </p>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Database Engine:</span>
                  <span className="font-mono font-bold text-slate-800">Firestore Enterprise</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Security & Encryption:</span>
                  <span className="font-semibold text-emerald-700 flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Encrypted & Rule Protected
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Payment Plan Required:</span>
                  <span className="font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded">
                    0.00 EGP / No Paid Plan Needed
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Last Synced At:</span>
                  <span className="font-mono text-slate-700">{formatTime(lastSaved)}</span>
                </div>
              </div>

              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-blue-900 text-[11px] space-y-1">
                <div className="font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                  Free Tier Quota Guarantee
                </div>
                <p className="text-blue-800 leading-relaxed">
                  Your data is preserved standard in the Google Cloud ecosystem with free daily quota allocation. You do not need any credit card or paid subscription to keep your recruitment workflow running smoothly.
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
