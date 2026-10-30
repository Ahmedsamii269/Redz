import React, { useState } from 'react';
import { Volume2, ExternalLink, X, CheckCircle, XCircle } from 'lucide-react';
import { parseVocarooUrl } from '../lib/vocaroo';

interface AudioPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  vocarooUrl: string;
  candidateName: string;
  companyName: string;
  onAcceptVoice?: () => void;
  onRejectVoice?: () => void;
  showAdminActions?: boolean;
}

export const AudioPlayerModal: React.FC<AudioPlayerModalProps> = ({
  isOpen,
  onClose,
  vocarooUrl,
  candidateName,
  companyName,
  onAcceptVoice,
  onRejectVoice,
  showAdminActions = false,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const info = parseVocarooUrl(vocarooUrl);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center text-red-600">
              <Volume2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Listen to Voice Note (Vocaroo)</h3>
              <p className="text-xs text-slate-500">
                {candidateName} · <span className="font-medium text-slate-700">{companyName}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Player Body */}
        <div className="p-6 space-y-5">
          {info.isValid && info.embedUrl ? (
            <div className="space-y-4">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <iframe
                  width="100%"
                  height="70"
                  src={info.embedUrl}
                  frameBorder="0"
                  title="Vocaroo Voice Player"
                  className="rounded"
                />
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="font-mono text-[11px]">Recording ID: {info.recordingId}</span>
                <a
                  href={info.originalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-red-600 hover:text-red-700 font-semibold"
                >
                  <span>Open on Vocaroo</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-amber-800 text-xs text-center space-y-2">
              <p className="font-semibold">Unable to embed direct audio player for this URL</p>
              <p className="font-mono text-[11px] break-all">{vocarooUrl || 'No URL provided'}</p>
              {vocarooUrl && (
                <a
                  href={vocarooUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-amber-600 text-white rounded-lg font-bold text-xs mt-2"
                >
                  <span>Open URL in New Tab</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          )}

          {/* Quick Decision Actions for CEO / Admin */}
          {showAdminActions && (
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <span className="text-[11px] font-semibold text-slate-700 block">
                Quick Voice Evaluation Action:
              </span>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    onAcceptVoice?.();
                    onClose();
                  }}
                  className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Accept Voice Note</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onRejectVoice?.();
                    onClose();
                  }}
                  className="py-2.5 px-3 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Reject Voice Note</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
