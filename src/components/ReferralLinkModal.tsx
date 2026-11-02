import React, { useState, useEffect } from 'react';
import { X, Copy, Check, Share2, ExternalLink, Building2, Send, QrCode } from 'lucide-react';
import { CompanyOffer, User } from '../types';

interface ReferralLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  recruiter: User | null;
  offers: CompanyOffer[];
  initialOffer?: CompanyOffer | null;
  onOpenCandidateView?: (offerId: string, recruiterCode: string) => void;
}

export const ReferralLinkModal: React.FC<ReferralLinkModalProps> = ({
  isOpen,
  onClose,
  recruiter,
  offers,
  initialOffer,
  onOpenCandidateView,
}) => {
  const [selectedOfferId, setSelectedOfferId] = useState<string>(
    initialOffer?.id || (offers.length > 0 ? offers[0].id : '')
  );
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedMessage, setCopiedMessage] = useState(false);

  useEffect(() => {
    if (initialOffer?.id) {
      setSelectedOfferId(initialOffer.id);
    } else if (offers.length > 0 && !selectedOfferId) {
      setSelectedOfferId(offers[0].id);
    }
  }, [initialOffer?.id, offers]);

  if (!isOpen) return null;

  const selectedOffer = offers.find((o) => o.id === selectedOfferId) || offers[0];
  const refCode = recruiter?.referralCode || recruiter?.username || 'ceo_ahmed';

  // Base URL calculation
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://app.redzagency.com';
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '/';
  const referralUrl = `${origin}${pathname}?view=apply&ref=${encodeURIComponent(refCode)}&offer=${encodeURIComponent(selectedOfferId)}`;

  const whatsappMessage = `Hello! Regarding the opportunity at ${selectedOffer?.companyName || 'our partner company'} (${selectedOffer?.title || ''}):
Package: ${selectedOffer?.salaryPackage || 'Competitive Salary'}
Location: ${selectedOffer?.location || 'Cairo / Giza'}
Hours: ${selectedOffer?.workingHours || 'Standard shifts'}
Please fill in the application form, attach your Vocaroo English voice note, and book your interview slot via the following link:
${referralUrl}
Best of luck!
REDZ Recruitment Agency

🔔 Follow us for more job offers:
📘 Facebook: https://www.facebook.com/share/1UXfCR6QMC/?mibextid=wwXIfr
💼 LinkedIn: https://www.linkedin.com/company/redz-recruitment1/`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center text-red-600">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Generate Company Referral Link</h3>
              <p className="text-xs text-slate-500">
                Locked to your recruiter code: <span className="font-mono font-bold text-red-600">{refCode}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* Select Target Company */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Target Company Offer *</label>
            <select
              value={selectedOfferId}
              onChange={(e) => setSelectedOfferId(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white font-medium"
            >
              {offers.map((off) => (
                <option key={off.id} value={off.id}>
                  {off.companyName} — {off.title} ({off.salaryPackage})
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-400 mt-1">
              When the candidate opens this link, the form will automatically lock to <strong>{selectedOffer?.companyName}</strong>.
            </p>
          </div>

          {/* Direct Link Box */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Direct Candidate Link</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={referralUrl}
                className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50 font-mono text-xs select-all"
              />
              <button
                type="button"
                onClick={handleCopyLink}
                className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold flex items-center gap-1.5 shrink-0 transition-colors"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Link</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row gap-2">
            {onOpenCandidateView && (
              <button
                onClick={() => {
                  onClose();
                  onOpenCandidateView(selectedOfferId, refCode);
                }}
                className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Open Application Form</span>
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
