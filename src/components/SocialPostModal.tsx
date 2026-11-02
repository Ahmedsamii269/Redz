import React, { useState, useEffect } from 'react';
import {
  X,
  Copy,
  Check,
  Share2,
  Building2,
  Phone,
  MessageCircle,
  FileText,
  Calendar,
  Clock,
  MapPin,
  DollarSign,
  Briefcase,
  Sparkles,
  Save,
} from 'lucide-react';
import { CompanyOffer, User } from '../types';
import { saveRecruiter } from '../lib/storage';

interface SocialPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  offer: CompanyOffer | null;
  recruiter: User | null;
  allOffers?: CompanyOffer[];
  onSelectOffer?: (offer: CompanyOffer) => void;
  onOpenCandidateView?: (offerId: string, recruiterCode: string) => void;
}

export const SocialPostModal: React.FC<SocialPostModalProps> = ({
  isOpen,
  onClose,
  offer,
  recruiter,
  allOffers = [],
  onSelectOffer,
}) => {
  const [activeTab, setActiveTab] = useState<'post' | 'details'>('post');
  // Exactly matching the recruiter's configured phone from their user profile
  const [recruiterPhone, setRecruiterPhone] = useState<string>(
    recruiter?.phone || ''
  );
  const [copiedPost, setCopiedPost] = useState(false);
  const [isSavingPhone, setIsSavingPhone] = useState(false);
  const [phoneSaved, setPhoneSaved] = useState(false);

  // Sync phone strictly with recruiter's user profile
  useEffect(() => {
    if (recruiter?.phone !== undefined) {
      setRecruiterPhone(recruiter.phone);
    }
  }, [recruiter?.phone, recruiter?.id]);

  if (!isOpen || !offer) return null;

  // Generate clean Egyptian WhatsApp link
  const cleanPhone = (recruiterPhone || '').replace(/[^0-9]/g, '');
  let waNumber = cleanPhone;
  if (waNumber.startsWith('01')) {
    waNumber = '2' + waNumber;
  }

  // Format requirements in clean English
  const reqLines =
    offer.requirements && offer.requirements.length > 0
      ? offer.requirements.map((r) => `  • ${r}`).join('\n')
      : '  • Fluent English speakers (B2 / C1 level)\n  • Graduates & dropouts welcome\n  • Excellent communication skills';

  // Format slots in clean English
  const slotLines =
    offer.interviewSlots && offer.interviewSlots.length > 0
      ? offer.interviewSlots.map((s) => `  • ${s.day} (${s.time}) — [${s.mode}]`).join('\n')
      : '  • Flexible interview slots scheduled after language assessment';

  // 100% English Hiring Post - NO application link included as explicitly requested!
  const postText = `📢 WE ARE HIRING! 🚀
Exciting Career Opportunity with REDZ Recruitment Agency

🏢 Company: ${offer.companyName}
💼 Position: ${offer.title}
📍 Location: ${offer.location || 'Cairo / Giza'} (${offer.workType || 'On-site'})
💰 Salary Package: ${offer.salaryPackage || 'Competitive salary package + bonus'}
⏰ Working Hours & Shifts: ${offer.workingHours || 'Rotational shifts | 5 working days & 2 days off'}

📌 Requirements & Qualifications:
${reqLines}
${offer.notes ? `\n💡 Additional Details:\n  • ${offer.notes}` : ''}
🗓️ Scheduled Interview Slots:
${slotLines}

══════════════════════════════════
📞 TO APPLY OR FOR DIRECT INQUIRIES VIA WHATSAPP:
📱 Mobile: ${recruiterPhone || 'Your Mobile Number'}
💬 Direct WhatsApp Chat: https://wa.me/${waNumber || '201012345678'}
══════════════════════════════════

Best of luck to all candidates! ✨
REDZ Recruitment Agency

🔔 Follow us for more job offers:
📘 Facebook: https://www.facebook.com/share/1UXfCR6QMC/?mibextid=wwXIfr
💼 LinkedIn: https://www.linkedin.com/company/redz-recruitment1/`;

  const handleCopyPost = () => {
    navigator.clipboard.writeText(postText);
    setCopiedPost(true);
    setTimeout(() => setCopiedPost(false), 2500);
  };

  const handleWhatsAppShare = () => {
    const encoded = encodeURIComponent(postText);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  const handleSavePhoneToProfile = async () => {
    if (!recruiter) return;
    setIsSavingPhone(true);
    try {
      await saveRecruiter({
        ...recruiter,
        phone: recruiterPhone.trim(),
      });
      setPhoneSaved(true);
      setTimeout(() => setPhoneSaved(false), 2500);
    } catch (err) {
      console.warn('Could not save phone to user profile:', err);
    } finally {
      setIsSavingPhone(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600/30 border border-red-500/40 flex items-center justify-center text-red-400">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-white">Social Media Post Generator</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/30 font-semibold">
                  {offer.companyName}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                100% English recruitment post ready for Facebook & LinkedIn — Ends with your WhatsApp & mobile number
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Switch Company & Tabs Bar */}
        <div className="px-5 py-2.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Quick Offer Selector */}
          {allOffers.length > 0 && onSelectOffer && (
            <div className="flex items-center gap-2 flex-1 min-w-[220px]">
              <span className="text-slate-500 font-semibold shrink-0">Company Offer:</span>
              <select
                value={offer.id}
                onChange={(e) => {
                  const target = allOffers.find((o) => o.id === e.target.value);
                  if (target) onSelectOffer(target);
                }}
                className="w-full max-w-xs p-1.5 rounded-lg border border-slate-300 bg-white font-medium text-xs focus:ring-2 focus:ring-red-500"
              >
                {allOffers.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.companyName} - {o.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Mode Switch Tabs */}
          <div className="flex items-center gap-1 bg-slate-200/70 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setActiveTab('post')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'post'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-red-600" />
              <span>English Post 📢</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('details')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'details'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-blue-600" />
              <span>Offer Details 🏢</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
          {activeTab === 'post' ? (
            <>
              {/* Recruiter Phone Number Box directly tied to user profile */}
              <div className="p-3.5 bg-gradient-to-r from-red-50 to-amber-50 rounded-xl border border-red-200/80 shadow-2xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-red-600 text-white flex items-center justify-center shrink-0">
                      <Phone className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="font-bold text-slate-900 block text-xs">
                        Recruiter Mobile / WhatsApp (from your User Profile):
                      </span>
                      <span className="text-[11px] text-slate-600">
                        {recruiter ? `User: ${recruiter.fullName} (${recruiter.username})` : 'Active Recruiter'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={recruiterPhone}
                      onChange={(e) => setRecruiterPhone(e.target.value)}
                      placeholder="e.g. 01012345678"
                      className="px-3 py-1.5 rounded-lg border border-red-300 bg-white font-mono font-bold text-xs text-slate-900 focus:ring-2 focus:ring-red-500 w-36 shadow-inner"
                    />
                    {recruiter && (
                      <button
                        type="button"
                        onClick={handleSavePhoneToProfile}
                        disabled={isSavingPhone}
                        className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-[11px] font-semibold transition-colors flex items-center gap-1 shrink-0"
                        title="Save this phone number to your user account permanently"
                      >
                        <Save className="w-3 h-3 text-red-400" />
                        <span>{phoneSaved ? 'Saved! ✓' : 'Save'}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Toast confirmation */}
              {copiedPost && (
                <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in duration-200 shadow-sm">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>✅ Post text copied to clipboard! Ready to publish on LinkedIn, Facebook, and WhatsApp groups.</span>
                </div>
              )}

              {/* Live Post Container */}
              <div className="relative">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-bold text-slate-700 flex items-center gap-1.5">
                    <span>Preview Hiring Post (100% English — No Application Link):</span>
                  </label>
                  <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    ✓ Clean Post (No Apply Links)
                  </span>
                </div>

                <div className="relative">
                  <textarea
                    readOnly
                    value={postText}
                    rows={13}
                    className="w-full p-4 rounded-xl border border-slate-300 bg-slate-50/90 font-sans text-xs leading-relaxed text-slate-800 select-all shadow-inner focus:outline-none focus:border-red-400"
                  />
                  <div className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-white/95 px-2.5 py-1 rounded-lg border border-slate-200 shadow-xs text-[11px] font-semibold text-emerald-700">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Ending on Mobile: {recruiterPhone || 'Not set'}</span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* Full Offer Details Tab */
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-red-600 tracking-wider">
                      {offer.industry || 'BPO & Call Center'}
                    </span>
                    <h2 className="text-lg font-bold text-slate-900">{offer.companyName}</h2>
                    <h3 className="text-sm font-semibold text-red-600">{offer.title}</h3>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                      offer.isAvailable
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {offer.isAvailable ? 'Hiring Open' : 'On Hold'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200 text-xs">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-emerald-600" />
                    <div>
                      <span className="text-slate-400 text-[10px] block">Salary & Package:</span>
                      <span className="font-bold text-slate-900">{offer.salaryPackage}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-red-600" />
                    <div>
                      <span className="text-slate-400 text-[10px] block">Location & Work Type:</span>
                      <span className="font-semibold text-slate-800">
                        {offer.location} ({offer.workType})
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-600" />
                    <div>
                      <span className="text-slate-400 text-[10px] block">Working Hours & Shifts:</span>
                      <span className="font-medium text-slate-800">{offer.workingHours}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <div>
                      <span className="text-slate-400 text-[10px] block">Interview Slots:</span>
                      <span className="font-medium text-slate-800">
                        {offer.interviewSlots?.length || 0} scheduled slots
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Requirements */}
              {offer.requirements && offer.requirements.length > 0 && (
                <div className="p-4 bg-white rounded-xl border border-slate-200">
                  <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-1.5">
                    <Briefcase className="w-4 h-4 text-red-600" />
                    Requirements & Qualifications:
                  </h4>
                  <ul className="space-y-1.5 text-slate-700">
                    {offer.requirements.map((req, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-red-500 font-bold">•</span>
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Scheduled Slots */}
              {offer.interviewSlots && offer.interviewSlots.length > 0 && (
                <div className="p-4 bg-white rounded-xl border border-slate-200">
                  <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-red-600" />
                    Scheduled Interview Slots:
                  </h4>
                  <div className="divide-y divide-slate-100">
                    {offer.interviewSlots.map((slot) => (
                      <div key={slot.id} className="py-2 flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-800">{slot.day}</span>
                        <span className="text-slate-600 font-mono">{slot.time}</span>
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px]">
                          {slot.mode}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions Bar */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2.5">
          <div className="text-slate-500 text-[11px] font-medium flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5 text-red-600" />
            <span>Mobile at end of post: <strong className="text-slate-900 font-mono">{recruiterPhone || 'Not set'}</strong></span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleWhatsAppShare}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Share to WhatsApp</span>
            </button>

            <button
              type="button"
              onClick={handleCopyPost}
              className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2"
            >
              {copiedPost ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copiedPost ? 'Copied to Clipboard! ✓' : 'Copy Post Text 📋'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
