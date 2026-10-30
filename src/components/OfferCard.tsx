import React, { useState } from 'react';
import {
  Building2,
  Calendar,
  Clock,
  MapPin,
  DollarSign,
  Copy,
  Check,
  Share2,
  ExternalLink,
  Sparkles,
  Edit,
  Trash2,
  Users,
  ChevronDown,
  ChevronUp,
  Link as LinkIcon,
  Briefcase,
} from 'lucide-react';
import { CompanyOffer, User } from '../types';
import { formatFullOfferText, REDZ_OFFICIAL_LINKS } from '../lib/offerFormatter';

interface OfferCardProps {
  offer: CompanyOffer;
  candidateCount?: number;
  currentUser: User;
  onOpenSocialPost: (offer: CompanyOffer) => void;
  onOpenReferralModal: (offer: CompanyOffer) => void;
  onOpenCandidateView: (offerId: string, recruiterCode: string) => void;
  onEditOffer?: (offer: CompanyOffer) => void;
  onDeleteOffer?: (offerId: string) => void;
  isAdmin?: boolean;
}

export const OfferCard: React.FC<OfferCardProps> = ({
  offer,
  candidateCount = 0,
  currentUser,
  onOpenSocialPost,
  onOpenReferralModal,
  onOpenCandidateView,
  onEditOffer,
  onDeleteOffer,
  isAdmin = false,
}) => {
  const [copiedFullOffer, setCopiedFullOffer] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showSlots, setShowSlots] = useState(false);

  // Pick deterministic accent colors for company avatars based on company name
  const getAvatarColor = (name: string) => {
    const colors = [
      'bg-red-600 text-white',
      'bg-blue-600 text-white',
      'bg-emerald-600 text-white',
      'bg-purple-600 text-white',
      'bg-amber-600 text-white',
      'bg-indigo-600 text-white',
      'bg-teal-600 text-white',
      'bg-rose-600 text-white',
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const companyInitials = offer.companyName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join('');

  // Handle Copy Full Offer text with follow links at the end
  const handleCopyFullOffer = () => {
    const fullText = formatFullOfferText(offer, {
      recruiterPhone: currentUser.phone,
      recruiterCode: currentUser.referralCode,
    });
    navigator.clipboard.writeText(fullText);
    setCopiedFullOffer(true);
    setTimeout(() => setCopiedFullOffer(false), 2500);
  };

  // Handle Quick Copy of Referral Link
  const handleQuickCopyLink = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://app.redzagency.com';
    const pathname = typeof window !== 'undefined' ? window.location.pathname : '/';
    const refCode = currentUser.referralCode || currentUser.username || 'admin';
    const url = `${origin}${pathname}?view=apply&ref=${encodeURIComponent(refCode)}&offer=${encodeURIComponent(offer.id)}`;
    
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden">
      <div>
        {/* Card Header Strip */}
        <div className="p-5 pb-4 border-b border-slate-100 bg-gradient-to-b from-slate-50/60 to-white">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center font-black text-sm tracking-wider shadow-xs shrink-0 ${getAvatarColor(
                  offer.companyName
                )}`}
              >
                {companyInitials || 'RZ'}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-extrabold text-slate-900 text-sm tracking-tight">
                    {offer.companyName}
                  </h3>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      offer.isAvailable
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-slate-100 text-slate-500 border-slate-200'
                    }`}
                  >
                    {offer.isAvailable ? '● Hiring Active' : '○ On Hold'}
                  </span>
                </div>
                <h4 className="font-bold text-red-600 text-xs mt-1 leading-snug">
                  {offer.title}
                </h4>
              </div>
            </div>

            {/* Admin Controls (Edit / Delete) */}
            {isAdmin && (
              <div className="flex items-center gap-1 shrink-0">
                {onEditOffer && (
                  <button
                    onClick={() => onEditOffer(offer)}
                    className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                    title="Edit Offer"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                )}
                {onDeleteOffer && (
                  <button
                    onClick={() => {
                      if (confirm(`Are you sure you want to delete the offer for "${offer.companyName}"?`)) {
                        onDeleteOffer(offer.id);
                      }
                    }}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete Offer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Specs Grid */}
        <div className="p-5 space-y-3.5 text-xs">
          {/* Salary Package Highlight */}
          <div className="p-3 bg-emerald-50/70 border border-emerald-200/70 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <DollarSign className="w-3.5 h-3.5" />
              </div>
              <span className="text-[11px] font-bold text-emerald-900">Salary Package</span>
            </div>
            <span className="font-mono font-black text-emerald-700 text-xs sm:text-sm">
              {offer.salaryPackage || 'Competitive Package'}
            </span>
          </div>

          {/* Key Details Matrix */}
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-2">
              <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
              <div>
                <span className="text-slate-400 block text-[10px] font-medium">Location</span>
                <span className="font-bold text-slate-800 leading-tight block">
                  {offer.location || 'Cairo / Giza'}
                </span>
                <span className="inline-block mt-0.5 text-[9px] px-1.5 py-0.2 bg-white text-slate-600 border border-slate-200 rounded font-semibold">
                  {offer.workType || 'On-site'}
                </span>
              </div>
            </div>

            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-2">
              <Clock className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
              <div>
                <span className="text-slate-400 block text-[10px] font-medium">Working Hours</span>
                <span className="font-bold text-slate-800 leading-tight block truncate max-w-[130px]" title={offer.workingHours}>
                  {offer.workingHours || 'Standard shifts'}
                </span>
                <span className="text-[9px] text-slate-400">Rotational / Offs</span>
              </div>
            </div>
          </div>

          {/* Requirements Preview (if available) */}
          {offer.requirements && offer.requirements.length > 0 && (
            <div className="pt-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1 flex items-center gap-1">
                <Briefcase className="w-3 h-3 text-slate-400" />
                Requirements:
              </span>
              <ul className="space-y-1 text-slate-600 text-[11px]">
                {offer.requirements.slice(0, 2).map((req, idx) => (
                  <li key={idx} className="flex items-start gap-1.5 leading-snug">
                    <span className="text-red-500 font-bold shrink-0">•</span>
                    <span className="line-clamp-1">{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Scheduled Interview Slots Preview */}
          <div className="pt-1 border-t border-slate-100">
            <button
              onClick={() => setShowSlots(!showSlots)}
              className="w-full flex items-center justify-between text-[11px] font-semibold text-slate-600 hover:text-slate-900 transition-colors py-1"
            >
              <span className="flex items-center gap-1.5 text-slate-700">
                <Calendar className="w-3.5 h-3.5 text-red-600" />
                <span>
                  <strong>{offer.interviewSlots?.length || 0}</strong> Scheduled Interview Slots
                </span>
              </span>
              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                {showSlots ? 'Hide' : 'View'}
                {showSlots ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </span>
            </button>

            {showSlots && (
              <div className="mt-2 space-y-1.5 bg-slate-50 p-2.5 rounded-xl border border-slate-200/70 max-h-36 overflow-y-auto text-[11px]">
                {offer.interviewSlots && offer.interviewSlots.length > 0 ? (
                  offer.interviewSlots.map((slot) => (
                    <div
                      key={slot.id}
                      className="flex items-center justify-between p-1.5 bg-white rounded-lg border border-slate-100"
                    >
                      <span className="font-bold text-slate-800">{slot.day}</span>
                      <span className="font-mono text-[10px] text-slate-600 font-semibold">{slot.time}</span>
                      <span className="text-[9px] px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded">
                        {slot.mode || 'In-Person'}
                      </span>
                    </div>
                  ))
                ) : (
                  <span className="text-slate-400 text-[10px] italic">
                    Flexible booking based on language assessment.
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Candidates registered count */}
          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              <span>Registered Candidates:</span>
            </span>
            <span className="font-bold text-slate-900 font-mono bg-slate-100 px-2 py-0.5 rounded-md">
              {candidateCount}
            </span>
          </div>

          {/* User Requested Footer: Official REDZ Social Media Channels */}
          <div className="p-3 bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl text-white shadow-xs space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold text-amber-300 flex items-center gap-1 tracking-tight">
                <span>🔔</span> Follow us for more job offers:
              </span>
              <span className="text-[9px] font-mono text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                REDZ Official
              </span>
            </div>
            
            <div className="space-y-1 text-[11px] pt-1">
              <a
                href={REDZ_OFFICIAL_LINKS.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-blue-200 hover:text-white transition-colors group"
                title="Open REDZ Facebook Page"
              >
                <span>📘</span>
                <span className="font-bold text-blue-300 group-hover:underline">Facebook:</span>
                <span className="font-mono text-[10px] text-slate-300 truncate max-w-[200px] sm:max-w-xs">
                  {REDZ_OFFICIAL_LINKS.facebook}
                </span>
                <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-white shrink-0 ml-auto" />
              </a>

              <a
                href={REDZ_OFFICIAL_LINKS.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-sky-200 hover:text-white transition-colors group"
                title="Open REDZ LinkedIn Page"
              >
                <span>💼</span>
                <span className="font-bold text-sky-300 group-hover:underline">LinkedIn:</span>
                <span className="font-mono text-[10px] text-slate-300 truncate max-w-[200px] sm:max-w-xs">
                  {REDZ_OFFICIAL_LINKS.linkedin}
                </span>
                <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-white shrink-0 ml-auto" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Card Action Buttons Bar */}
      <div className="p-4 pt-3 border-t border-slate-100 bg-slate-50/50 space-y-2">
        {/* Primary Action: Copy Full Offer with Links */}
        <button
          onClick={handleCopyFullOffer}
          className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 ${
            copiedFullOffer
              ? 'bg-emerald-600 text-white shadow-emerald-500/20'
              : 'bg-red-600 hover:bg-red-700 text-white shadow-red-500/20'
          }`}
          title="Copy complete offer text with official follow links appended at the end"
        >
          {copiedFullOffer ? (
            <>
              <Check className="w-4 h-4 text-white" />
              <span>Copied with Follow Links! ✓</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              <span>Copy Full Offer</span>
            </>
          )}
        </button>

        {/* Secondary Actions Row */}
        <div className="grid grid-cols-3 gap-2">
          {/* Social Post Modal Button */}
          <button
            onClick={() => onOpenSocialPost(offer)}
            className="py-2 px-2 bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 rounded-xl text-[11px] font-bold transition-colors flex items-center justify-center gap-1 shadow-2xs"
            title="Preview social media post format and customize phone"
          >
            <Sparkles className="w-3 h-3 text-amber-500" />
            <span className="truncate">Social Post</span>
          </button>

          {/* Quick Copy Referral Link Button */}
          <button
            onClick={handleQuickCopyLink}
            className="py-2 px-2 bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 rounded-xl text-[11px] font-bold transition-colors flex items-center justify-center gap-1 shadow-2xs"
            title="Copy locked referral application link for candidates"
          >
            {copiedLink ? (
              <>
                <Check className="w-3 h-3 text-emerald-600" />
                <span className="truncate text-emerald-700 font-bold">Copied!</span>
              </>
            ) : (
              <>
                <LinkIcon className="w-3 h-3 text-blue-600" />
                <span className="truncate">Copy Link</span>
              </>
            )}
          </button>

          {/* Referral Link & Application Form Modal */}
          <button
            onClick={() => onOpenReferralModal(offer)}
            className="py-2 px-2 bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 rounded-xl text-[11px] font-bold transition-colors flex items-center justify-center gap-1 shadow-2xs"
            title="Generate locked referral link or open application form"
          >
            <Share2 className="w-3 h-3 text-red-600" />
            <span className="truncate">Referral Link</span>
          </button>
        </div>
      </div>
    </div>
  );
};
