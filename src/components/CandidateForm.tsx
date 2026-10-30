import React, { useState, useEffect } from 'react';
import {
  Building2,
  Calendar,
  Mic,
  CheckCircle2,
  Lock,
  UserCheck,
  AlertCircle,
  ExternalLink,
  Phone,
  Mail,
  User as UserIcon,
  MapPin,
  GraduationCap,
  Globe2,
  ArrowRight,
  Briefcase,
  Plus,
} from 'lucide-react';
import { CompanyOffer, User } from '../types';
import { subscribeToOffers, subscribeToRecruiters, submitApplication, saveOffer, findApplicationByPhone } from '../lib/storage';
import { parseVocarooUrl } from '../lib/vocaroo';
import { OfferModal } from './OfferModal';

interface CandidateFormProps {
  initialOfferId?: string;
  initialRecruiterCode?: string;
  onSuccessReturn?: () => void;
  isStandalone?: boolean;
}

export const CandidateForm: React.FC<CandidateFormProps> = ({
  initialOfferId,
  initialRecruiterCode,
  onSuccessReturn,
  isStandalone = false,
}) => {
  const [offers, setOffers] = useState<CompanyOffer[]>([]);
  const [recruiters, setRecruiters] = useState<User[]>([]);
  
  // URL params extraction or props
  const [selectedOfferId, setSelectedOfferId] = useState<string>('');
  const [recruiterCode, setRecruiterCode] = useState<string>('');
  const [isCompanyLocked, setIsCompanyLocked] = useState<boolean>(false);

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [graduationStatus, setGraduationStatus] = useState<'graduated' | 'undergraduate' | 'student'>('graduated');
  const [isEgyptian, setIsEgyptian] = useState<boolean>(true);
  const [otherNationality, setOtherNationality] = useState('');
  const [residence, setResidence] = useState('');
  const [experienceLevel, setExperienceLevel] = useState<string>('Fresh Graduate / No Experience');
  const [experienceCategory, setExperienceCategory] = useState<string>('Customer Service');
  const [experienceDetails, setExperienceDetails] = useState<string>('');
  const [vocarooUrl, setVocarooUrl] = useState('');
  const [vocarooUrl2, setVocarooUrl2] = useState('');
  const [selectedSlotId, setSelectedSlotId] = useState('');

  const [scheduledTime, setScheduledTime] = useState('11:00');

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedAppCode, setSubmittedAppCode] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [duplicateWarning, setDuplicateWarning] = useState<{ company: string } | null>(null);
  const [isAddOfferModalOpen, setIsAddOfferModalOpen] = useState(false);

  const handleSaveNewOffer = async (offerData: Partial<CompanyOffer> & { title: string; companyName: string }) => {
    try {
      const saved = await saveOffer(offerData);
      setOffers((prev) => {
        const exists = prev.some((o) => o.id === saved.id);
        if (exists) {
          return prev.map((o) => (o.id === saved.id ? saved : o));
        }
        return [saved, ...prev];
      });
      setSelectedOfferId(saved.id);
      setIsAddOfferModalOpen(false);
    } catch (err) {
      console.error('Failed to create offer:', err);
      alert('Failed to save company offer. Please check your network and try again.');
    }
  };

  useEffect(() => {
    // Initial fetch
    const loadInitialData = async () => {
      // In real-time apps, we usually listen, but for a one-time form load is fine too
      // Since App.tsx already subscribes, we can just get current values or use the same subscription logic
      const unsubOffers = subscribeToOffers((allOffers) => {
        const available = allOffers.filter(o => o.isAvailable);
        setOffers(available);
        
        // Match offer from URL after data is loaded
        const urlParams = new URLSearchParams(window.location.search);
        const urlOffer = urlParams.get('offer') || urlParams.get('company') || initialOfferId || '';
        if (urlOffer) {
          const matched = available.find(o => 
            o.id.toLowerCase() === urlOffer.toLowerCase() || 
            o.companyName.toLowerCase().includes(urlOffer.toLowerCase())
          );
          if (matched) {
            setSelectedOfferId(matched.id);
            setIsCompanyLocked(true);
          } else if (available.length > 0) {
            setSelectedOfferId(available[0].id);
          }
        } else if (available.length > 0) {
          setSelectedOfferId(available[0].id);
        }
      });

      const unsubRecruiters = subscribeToRecruiters((allRecs) => {
        setRecruiters(allRecs);
        const urlParams = new URLSearchParams(window.location.search);
        const urlRef = urlParams.get('ref') || initialRecruiterCode || '';
        if (urlRef) setRecruiterCode(urlRef);
      });

      return () => {
        unsubOffers();
        unsubRecruiters();
      };
    };

    loadInitialData();
  }, [initialOfferId, initialRecruiterCode]);

  const currentOffer = offers.find((o) => o.id === selectedOfferId) || (offers.length > 0 ? offers[0] : null);
  const assignedRecruiter = recruiters.find(
    (r) => r.referralCode?.toLowerCase() === recruiterCode.toLowerCase() || r.username.toLowerCase() === recruiterCode.toLowerCase()
  );

  // Set default slot when offer changes
  useEffect(() => {
    if (currentOffer && currentOffer.interviewSlots && Array.isArray(currentOffer.interviewSlots) && currentOffer.interviewSlots.length > 0) {
      setSelectedSlotId(currentOffer.interviewSlots[0].id);
    } else {
      setSelectedSlotId('');
    }
  }, [selectedOfferId, currentOffer]);

  const vocarooInfo = parseVocarooUrl(vocarooUrl);
  const vocarooInfo2 = parseVocarooUrl(vocarooUrl2);

  // Anti-Duplicate Check Logic
  useEffect(() => {
    const checkDuplicate = async () => {
      // Basic validation to avoid unnecessary queries
      if (phone.length >= 10) {
        const existing = await findApplicationByPhone(phone);
        if (existing) {
          setDuplicateWarning({ company: existing.companyName });
        } else {
          setDuplicateWarning(null);
        }
      } else {
        setDuplicateWarning(null);
      }
    };

    const timer = setTimeout(checkDuplicate, 600);
    return () => clearTimeout(timer);
  }, [phone]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!fullName.trim()) {
      setFormError('Please enter your full name as shown on your national ID.');
      return;
    }
    const cleanPhone = phone.trim().replace(/\D/g, '');
    if (!/^01[0125][0-9]{8}$/.test(cleanPhone)) {
      setFormError('Invalid phone number. Egyptian phone numbers must be exactly 11 digits starting with 01 (e.g. 01012345678).');
      return;
    }
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!email.trim() || !emailRegex.test(email.trim())) {
      setFormError('Please enter a valid email address with a proper domain (e.g. candidate@gmail.com).');
      return;
    }
    if (!currentOffer) {
      setFormError('Please select a target company offer.');
      return;
    }
    if (!vocarooUrl.trim()) {
      setFormError('Please record a Vocaroo voice note and paste the link to assess your English level.');
      return;
    }
    if (!vocarooInfo.isValid) {
      setFormError('Invalid English Vocaroo link. Please make sure to copy a valid link from vocaroo.com');
      return;
    }
    if (vocarooUrl2.trim() && !vocarooInfo2.isValid) {
      setFormError('Invalid second Vocaroo link. Please ensure it is a valid URL or leave it empty.');
      return;
    }
    if (!selectedSlotId && currentOffer.interviewSlots && Array.isArray(currentOffer.interviewSlots) && currentOffer.interviewSlots.length > 0) {
      setFormError('Please select a suitable interview slot.');
      return;
    }

    setIsSubmitting(true);

    try {
      let slotDetails = 'Flexible / Arranged by HR';
      let scheduledDateISO: string | undefined;

      if (currentOffer.schedulingRules) {
        // Dynamic scheduling
        slotDetails = `${selectedSlotId} at ${scheduledTime}`;
        scheduledDateISO = `${selectedSlotId}T${scheduledTime}:00`;
      } else {
        // Static slots
        const chosenSlot = Array.isArray(currentOffer.interviewSlots) 
          ? currentOffer.interviewSlots.find((s) => s.id === selectedSlotId)
          : null;
        slotDetails = chosenSlot ? `${chosenSlot.day} (${chosenSlot.time})` : 'Flexible / Arranged by HR';
      }

      const newApp = await submitApplication({
        fullName: fullName.trim(),
        phone: phone.trim(),
        email: email.trim() || `${phone.replace(/\D/g, '')}@candidate.redzagency.com`,
        graduationStatus,
        isEgyptian,
        otherNationality: isEgyptian ? undefined : otherNationality.trim() || 'Other',
        residence: residence.trim() || 'Cairo / Giza',
        experienceLevel,
        experienceCategory: experienceLevel === 'Fresh Graduate / No Experience' ? undefined : experienceCategory,
        experienceDetails: experienceDetails.trim() || (experienceLevel === 'Fresh Graduate / No Experience' ? 'Fresh Graduate' : undefined),
        companyId: currentOffer.id,
        companyName: currentOffer.companyName,
        offerId: currentOffer.id,
        offerTitle: currentOffer.title,
        vocarooUrl: vocarooInfo.originalUrl,
        vocarooUrl2: vocarooUrl2.trim() ? vocarooInfo2.originalUrl : undefined,
        interviewSlotId: selectedSlotId || 'default-slot',
        interviewSlotDetails: slotDetails,
        scheduledDate: scheduledDateISO,
        recruiterId: assignedRecruiter?.id || 'direct-pool',
        recruiterName: assignedRecruiter?.fullName || 'Direct Application',
        recruiterCode: recruiterCode || 'direct',
        status: 'Pending Feedback',
      });

      setSubmittedAppCode(newApp.referenceCode);
    } catch (err: any) {
      console.error('Submission error details:', err);
      const rawMsg = err instanceof Error ? err.message : String(err);
      setFormError(`Error: ${rawMsg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Success Confirmation View
  if (submittedAppCode) {
    const successSlot = currentOffer?.interviewSlots && Array.isArray(currentOffer.interviewSlots)
      ? currentOffer.interviewSlots.find((s) => s.id === selectedSlotId)
      : null;

    return (
      <div className="max-w-xl mx-auto my-8 p-8 bg-white rounded-2xl shadow-sm border border-slate-200 text-center animate-in zoom-in-95 duration-200">
        <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-5 border border-emerald-100">
          <CheckCircle2 className="w-9 h-9" />
        </div>

        <h2 className="text-2xl font-bold text-slate-900 mb-2">Application Submitted Successfully!</h2>
        <p className="text-sm text-slate-600 mb-6">
          Thank you, <span className="font-semibold text-slate-900">{fullName}</span>. Your application for{' '}
          <span className="font-bold text-red-600">{currentOffer?.companyName}</span> has been received.
        </p>

        {/* Reference Card */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 mb-6 text-left space-y-2.5 text-xs">
          <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
            <span className="text-slate-500">Application Reference ID:</span>
            <span className="font-mono text-base font-bold text-red-600 bg-red-50 px-2.5 py-0.5 rounded border border-red-200">
              {submittedAppCode}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Selected Company:</span>
            <span className="font-semibold text-slate-800">{currentOffer?.companyName}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Your Experience:</span>
            <span className="font-semibold text-slate-800">
              {experienceLevel} {experienceDetails ? `(${experienceDetails})` : ''}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Interview Slot Booked:</span>
            <span className="font-semibold text-emerald-700">
              {successSlot ? `${successSlot.day} (${successSlot.time})` : 'Flexible / Arranged by HR'}
            </span>
          </div>
          {assignedRecruiter && (
            <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
              <span className="text-slate-500">Assigned Recruiter:</span>
              <span className="font-medium text-slate-700">{assignedRecruiter.fullName}</span>
            </div>
          )}
        </div>

        <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl text-amber-900 text-xs text-left mb-6 space-y-1">
          <p className="font-bold flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            What is the next step?
          </p>
          <p className="text-amber-800 leading-relaxed">
            Our recruitment team will review your voice recording to evaluate your English proficiency. Detailed interview instructions, building address, and confirmation will be sent directly to your WhatsApp number: <span className="font-mono font-bold">{phone}</span>.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => {
              setSubmittedAppCode(null);
              setFullName('');
              setPhone('');
              setEmail('');
              setVocarooUrl('');
              setVocarooUrl2('');
              setResidence('');
              setExperienceDetails('');
            }}
            className="w-full sm:w-auto px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors"
          >
            Submit Another Candidate
          </button>
          {onSuccessReturn && (
            <button
              onClick={onSuccessReturn}
              className="w-full sm:w-auto px-5 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
            >
              Return to Dashboard
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto my-6 px-4">
      {/* Top Banner / Recruiter attribution notice */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-slate-900 via-slate-800 to-red-950 text-white relative">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
            <span className="text-xs uppercase tracking-wider text-red-300 font-medium">
              Official Candidate Registration
            </span>
            {assignedRecruiter && (
              <span className="inline-flex items-center gap-1.5 text-xs bg-red-500/20 text-red-200 border border-red-400/30 px-3 py-1 rounded-full">
                <UserCheck className="w-3.5 h-3.5" />
                Referred by: {assignedRecruiter.fullName}
              </span>
            )}
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
            Job Application & Interview Scheduling
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-lg">
            Please fill in your details accurately, select your preferred interview time, and attach your Vocaroo English voice note.
          </p>
        </div>

        {/* Locked / Selected Company Highlight Banner */}
        {currentOffer && (
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-red-600 shadow-xs">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-950">{currentOffer.companyName}</span>
                  {isCompanyLocked && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-red-100 text-red-800 px-2 py-0.5 rounded">
                      <Lock className="w-3 h-3" />
                      Locked by Recruiter Link
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600 font-medium">{currentOffer.title}</p>
              </div>
            </div>
            <div className="text-left sm:text-right">
              <span className="text-[11px] text-slate-500 block">Package / Salary:</span>
              <span className="text-xs font-bold text-red-700 font-mono">{currentOffer.salaryPackage}</span>
            </div>
          </div>
        )}

        {/* Error Notification */}
        {formError && (
          <div className="m-6 mb-0 p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{formError}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs text-left">
          {/* Section 1: Candidate Basic Info */}
          <div className="space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-2">
              <UserIcon className="w-4 h-4 text-red-600" />
              1. Personal & Contact Information
            </h3>

            {/* Name */}
            <div>
              <label htmlFor="cand-name" className="block font-semibold text-slate-700 mb-1">
                Full Name (as in National ID) *
              </label>
              <input
                id="cand-name"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Youssef Tarek El-Sayed"
                className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white text-slate-800 text-xs"
              />
            </div>

            {/* Phone & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="cand-phone" className="block font-semibold text-slate-700 mb-1">
                  Phone / Active WhatsApp Number *
                </label>
                <div className="relative">
                  <input
                    id="cand-phone"
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="01012345678"
                    className="w-full p-2.5 pl-8 rounded-lg border border-slate-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white font-mono text-xs"
                  />
                  <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3" />
                </div>
                {duplicateWarning && (
                  <div className="mt-1.5 p-2 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2 animate-in slide-in-from-top-1 duration-200">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-[10px] text-amber-800 leading-tight">
                      <span className="font-bold">Duplicate Warning:</span> This number already applied before to <span className="font-bold">"{duplicateWarning.company}"</span>. You can still submit, but please verify with the candidate.
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="cand-email" className="block font-semibold text-slate-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    id="cand-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="candidate@gmail.com"
                    className="w-full p-2.5 pl-8 rounded-lg border border-slate-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white text-xs"
                  />
                  <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3" />
                </div>
              </div>
            </div>

            {/* Graduation Status & Nationality */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-red-600" />
                  Graduation Status *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setGraduationStatus('graduated')}
                    className={`py-2 px-3 rounded-lg border text-center transition-all ${
                      graduationStatus === 'graduated'
                        ? 'border-red-600 bg-red-50/70 text-red-900 font-bold'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Graduated (Degree)
                  </button>
                  <button
                    type="button"
                    onClick={() => setGraduationStatus('undergraduate')}
                    className={`py-2 px-3 rounded-lg border text-center transition-all ${
                      graduationStatus !== 'graduated'
                        ? 'border-red-600 bg-red-50/70 text-red-900 font-bold'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Student / Undergrad
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <Globe2 className="w-4 h-4 text-red-600" />
                  Nationality *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEgyptian(true)}
                    className={`py-2 px-3 rounded-lg border text-center transition-all ${
                      isEgyptian
                        ? 'border-red-600 bg-red-50/70 text-red-900 font-bold'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Egyptian
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEgyptian(false)}
                    className={`py-2 px-3 rounded-lg border text-center transition-all ${
                      !isEgyptian
                        ? 'border-red-600 bg-red-50/70 text-red-900 font-bold'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Non-Egyptian
                  </button>
                </div>
              </div>
            </div>

            {!isEgyptian && (
              <div className="animate-in fade-in duration-150">
                <label htmlFor="cand-other-nat" className="block font-semibold text-slate-700 mb-1">
                  Specify Nationality & Residency Status in Egypt:
                </label>
                <input
                  id="cand-other-nat"
                  type="text"
                  required={!isEgyptian}
                  value={otherNationality}
                  onChange={(e) => setOtherNationality(e.target.value)}
                  placeholder="e.g. Syrian / Sudanese / Yemeni / Palestinian - Valid Residency"
                  className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white"
                />
              </div>
            )}

            {/* Residence */}
            <div>
              <label htmlFor="cand-residence" className="block font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-red-600" />
                Current City & Area of Residence *
              </label>
              <input
                id="cand-residence"
                type="text"
                required
                value={residence}
                onChange={(e) => setResidence(e.target.value)}
                placeholder="e.g. Cairo - Nasr City / Maadi / Giza - Haram / 6th of October / New Cairo..."
                className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white"
              />
            </div>
          </div>

          {/* Section 2: Your Experience */}
          <div className="space-y-4 pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-red-600" />
                2. Your Experience *
              </h3>
              <span className="text-[11px] text-slate-500 font-medium">All levels welcome</span>
            </div>

            {/* Experience Level Selector */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                Total Experience Level *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { id: 'Fresh Graduate / No Experience', label: 'Fresh Graduate', sub: '0 experience' },
                  { id: '1 - 6 Months', label: '1 – 6 Months', sub: 'Junior level' },
                  { id: '6 - 12 Months', label: '6 – 12 Months', sub: 'Mid-Junior' },
                  { id: '1 - 2 Years', label: '1 – 2 Years', sub: 'Experienced' },
                  { id: '2+ Years', label: '2+ Years', sub: 'Senior / SME' },
                ].map((lvl) => {
                  const isSel = experienceLevel === lvl.id;
                  return (
                    <button
                      key={lvl.id}
                      type="button"
                      onClick={() => setExperienceLevel(lvl.id)}
                      className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                        isSel
                          ? 'border-red-600 bg-red-50/70 text-red-950 font-bold shadow-2xs ring-1 ring-red-500/20'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span className="text-xs">{lvl.label}</span>
                      <span className={`text-[10px] mt-0.5 ${isSel ? 'text-red-700 font-medium' : 'text-slate-400'}`}>
                        {lvl.sub}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* If Experienced: Category & Details */}
            {experienceLevel !== 'Fresh Graduate / No Experience' ? (
              <div className="space-y-3 bg-slate-50/70 p-3.5 rounded-xl border border-slate-200 animate-in fade-in duration-200">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">
                    Field of Experience:
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      'Customer Service',
                      'Call Center / BPO',
                      'Tele-sales',
                      'Technical Support',
                      'Financial & Banking',
                      'Client Success',
                      'Other Domain',
                    ].map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setExperienceCategory(cat)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                          experienceCategory === cat
                            ? 'border-red-600 bg-red-600 text-white shadow-2xs font-semibold'
                            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label htmlFor="cand-experience-details" className="block font-semibold text-slate-700 mb-1">
                    Previous Company / Account Details:
                  </label>
                  <input
                    id="cand-experience-details"
                    type="text"
                    value={experienceDetails}
                    onChange={(e) => setExperienceDetails(e.target.value)}
                    placeholder="e.g. Concentrix (Vodafone UK Account) - 7 months / Webhelp - 1 year"
                    className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white text-slate-800 text-xs"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Mention the companies or accounts you worked on, or brief description of your role.
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-xl text-emerald-900 text-[11px] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  Fresh graduates are eligible for multiple accounts! English level (tested via Vocaroo) is the key hiring factor.
                </span>
              </div>
            )}
          </div>

          {/* Section 3: Selected Company */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Building2 className="w-4 h-4 text-red-600" />
              3. Selected Company Offer
            </h3>

            {isCompanyLocked && currentOffer ? (
              <div className="p-3.5 bg-slate-100/80 rounded-xl border border-slate-300/80 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-500 block font-medium">Selected Company (Locked by recruiter link):</span>
                  <span className="font-bold text-slate-900 text-sm">{currentOffer.companyName}</span>
                  <span className="text-slate-500 mx-2">·</span>
                  <span className="text-slate-600 font-medium">{currentOffer.title}</span>
                </div>
                <div className="flex items-center gap-1 text-slate-400 text-xs px-2 py-1 bg-white rounded border border-slate-200">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Locked</span>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block font-semibold text-slate-700">
                    Choose the company offer you wish to apply for:
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsAddOfferModalOpen(true)}
                    className="inline-flex items-center gap-1.5 text-[11px] font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100/80 px-2.5 py-1 rounded-lg border border-red-200 transition-colors shadow-2xs"
                    title="Add a new company and customize its interview slots"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Add Company / Offer</span>
                  </button>
                </div>
                <select
                  value={selectedOfferId}
                  onChange={(e) => {
                    if (e.target.value === '__ADD_NEW__') {
                      setIsAddOfferModalOpen(true);
                    } else {
                      setSelectedOfferId(e.target.value);
                    }
                  }}
                  className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white font-medium"
                >
                  {offers.map((off) => (
                    <option key={off.id} value={off.id}>
                      {off.companyName} - {off.title} ({off.salaryPackage})
                    </option>
                  ))}
                  <option value="__ADD_NEW__" className="font-bold text-red-600 bg-red-50">
                    + ➕ Add New Company...
                  </option>
                </select>
              </div>
            )}
          </div>

          {/* Section 4: Vocaroo Voice Note */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Mic className="w-4 h-4 text-red-600" />
                4. Vocaroo Voice Note (English Assessment) *
              </h3>
              <a
                href="https://vocaroo.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 px-2.5 py-1 rounded-lg border border-red-200 transition-colors"
              >
                Record on Vocaroo.com
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <p className="text-slate-500 leading-relaxed text-[11px]">
              Go to <a href="https://vocaroo.com" target="_blank" rel="noopener noreferrer" className="underline font-semibold text-slate-700">vocaroo.com</a>, record a 1 to 1.5 minute voice note in English (introducing yourself, your education, and your previous experience), then paste the link here.
            </p>

            <div>
              <input
                type="url"
                required
                value={vocarooUrl}
                onChange={(e) => setVocarooUrl(e.target.value)}
                placeholder="https://vocaroo.com/1xxxxxxx or https://voca.ro/1xxxxxxx"
                className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white font-mono text-xs"
              />
            </div>

            {/* Live Audio Preview 1 */}
            {vocarooInfo.isValid && vocarooInfo.embedUrl && (
              <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200 space-y-2 animate-in fade-in duration-200">
                <div className="flex items-center justify-between text-emerald-800 text-xs font-semibold">
                  <span>English voice note recognized!</span>
                  <span className="font-mono text-[10px] bg-emerald-100 px-2 py-0.5 rounded">
                    ID: {vocarooInfo.recordingId}
                  </span>
                </div>
                <iframe
                  width="100%"
                  height="60"
                  src={vocarooInfo.embedUrl}
                  frameBorder="0"
                  title="Vocaroo Preview 1"
                  className="rounded"
                />
              </div>
            )}

            {/* Optional Second Voice Note */}
            <div className="pt-4 border-t border-slate-100/50 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-800 text-[11px] flex items-center gap-2">
                  <Mic className="w-3.5 h-3.5 text-blue-600" />
                  Secondary Voice Note (Optional - French, German, etc.)
                </h4>
              </div>
              <p className="text-slate-500 leading-relaxed text-[10px]">
                If you are applying for a language account other than English (e.g. French, German), please provide a second recording in that language.
              </p>
              <input
                type="url"
                value={vocarooUrl2}
                onChange={(e) => setVocarooUrl2(e.target.value)}
                placeholder="Optional: https://vocaroo.com/2xxxxxxx"
                className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white font-mono text-xs"
              />
            </div>

            {/* Live Audio Preview 2 */}
            {vocarooInfo2.isValid && vocarooInfo2.embedUrl && (
              <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200 space-y-2 animate-in fade-in duration-200">
                <div className="flex items-center justify-between text-blue-800 text-xs font-semibold">
                  <span>Second voice note recognized!</span>
                </div>
                <iframe
                  width="100%"
                  height="60"
                  src={vocarooInfo2.embedUrl}
                  frameBorder="0"
                  title="Vocaroo Preview 2"
                  className="rounded"
                />
              </div>
            )}
          </div>

          {/* Section 5: Interview Slots */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Calendar className="w-4 h-4 text-red-600" />
                5. Available Interview Slots ({currentOffer?.companyName}) *
              </h3>
              <p className="text-slate-500 text-[11px] mt-0.5">
                Choose the day and time slot that suits you best for the personal interview:
              </p>
            </div>

            {currentOffer?.schedulingRules ? (
              <div className="p-4 bg-red-50/50 rounded-xl border border-red-100 space-y-4 animate-in fade-in duration-200">
                <div className="flex items-center gap-2 text-red-900 font-bold mb-2">
                  <Calendar className="w-4 h-4" />
                  <span>Schedule your interview for {currentOffer.companyName}</span>
                </div>

                {/* Day Selection */}
                <div>
                  <label className="block text-[11px] font-semibold text-red-800 mb-1.5">
                    1. Choose available day:
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {(() => {
                      const dates: Date[] = [];
                      const today = new Date();
                      const rules = currentOffer.schedulingRules!;
                      for (let i = 0; i < 30 && dates.length < 14; i++) {
                        const d = new Date();
                        d.setDate(today.getDate() + i);
                        if (rules.allowedDays.includes(d.getDay())) {
                          dates.push(new Date(d));
                        }
                      }
                      return dates.map((date) => {
                        const dateStr = date.toISOString().split('T')[0];
                        const isSel = selectedSlotId === dateStr;
                        return (
                          <button
                            key={dateStr}
                            type="button"
                            onClick={() => setSelectedSlotId(dateStr)}
                            className={`px-3 py-2 rounded-lg border text-center transition-all ${
                              isSel
                                ? 'bg-red-600 text-white border-red-700 font-bold shadow-sm'
                                : 'bg-white text-slate-700 border-red-200 hover:bg-red-50'
                            }`}
                          >
                            <div className="text-[10px] uppercase font-bold">
                              {date.toLocaleDateString('en-US', { weekday: 'short' })}
                            </div>
                            <div className="text-xs">
                              {date.getDate()} {date.toLocaleDateString('en-US', { month: 'short' })}
                            </div>
                          </button>
                        );
                      });
                    })()}
                  </div>
                </div>

                {/* Time Selection - Since it's candidate side, we might want a simple input or buttons */}
                <div>
                  <label className="block text-[11px] font-semibold text-red-800 mb-1.5">
                    2. Approximate time ({currentOffer.schedulingRules.startTime || 'Morning'} – {currentOffer.schedulingRules.endTime || 'Afternoon'}):
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="time"
                      required
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                      className="p-2 rounded-lg border border-red-200 text-xs font-mono"
                    />
                    <span className="text-[10px] text-red-600">
                      * HR will confirm the exact time via WhatsApp.
                    </span>
                  </div>
                </div>
              </div>
            ) : currentOffer?.interviewSlots && currentOffer.interviewSlots.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {currentOffer.interviewSlots.map((slot) => {
                  const isSelected = selectedSlotId === slot.id;
                  return (
                    <button
                      key={slot.id}
                      type="button"
                      onClick={() => setSelectedSlotId(slot.id)}
                      className={`p-3 rounded-xl border text-left transition-all flex items-start justify-between ${
                        isSelected
                          ? 'border-red-600 bg-red-50/60 shadow-xs ring-1 ring-red-500/20'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div>
                        <div className="font-bold text-slate-900 text-xs">{slot.day}</div>
                        <div className="text-[11px] text-slate-600 font-mono mt-0.5">{slot.time}</div>
                        <span className="text-[10px] text-red-700 bg-red-100/70 px-1.5 py-0.5 rounded mt-1 inline-block">
                          {slot.mode || 'In-Person Headquarters'}
                        </span>
                      </div>
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                          isSelected ? 'border-red-600 bg-red-600 text-white' : 'border-slate-300 bg-white'
                        }`}
                      >
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="p-3 bg-amber-50 rounded-lg text-amber-800 text-xs border border-amber-200">
                Our HR team will contact you directly via WhatsApp to coordinate the earliest available interview date.
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-4 border-t border-slate-100">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-6 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Submitting Application...</span>
              ) : (
                <>
                  <span>Submit Application & Book Interview</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
            <p className="text-center text-slate-400 text-[11px] mt-2">
              By clicking Submit, you confirm that your details are accurate and you are ready to attend the interview.
            </p>
          </div>
        </form>
      </div>

      {/* Quick Add Company / Offer Modal */}
      <OfferModal
        isOpen={isAddOfferModalOpen}
        onClose={() => setIsAddOfferModalOpen(false)}
        onSave={handleSaveNewOffer}
      />
    </div>
  );
};
