import React, { useState, useEffect } from 'react';
import { X, User, Phone, Mail, MapPin, Briefcase } from 'lucide-react';
import { CandidateApplication } from '../types';

interface CandidateEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidate: CandidateApplication | null;
  onSave: (updatedData: Partial<CandidateApplication>) => Promise<void>;
}

export const CandidateEditModal: React.FC<CandidateEditModalProps> = ({
  isOpen,
  onClose,
  candidate,
  onSave,
}) => {
  const [fullName, setFullName] = useState(candidate?.fullName || '');
  const [phone, setPhone] = useState(candidate?.phone || '');
  const [email, setEmail] = useState(candidate?.email || '');
  const [residence, setResidence] = useState(candidate?.residence || '');
  const [experienceLevel, setExperienceLevel] = useState(candidate?.experienceLevel || 'Fresh Graduate / No Experience');
  const [experienceDetails, setExperienceDetails] = useState(candidate?.experienceDetails || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (candidate) {
      setFullName(candidate.fullName || '');
      setPhone(candidate.phone || '');
      setEmail(candidate.email || '');
      setResidence(candidate.residence || '');
      setExperienceLevel(candidate.experienceLevel || 'Fresh Graduate / No Experience');
      setExperienceDetails(candidate.experienceDetails || '');
      setError(null);
    }
  }, [candidate?.id, candidate?.fullName, candidate?.phone, candidate?.email, candidate?.residence, candidate?.experienceLevel, candidate?.experienceDetails]);

  if (!isOpen || !candidate) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate phone exact 11 Egyptian digits starting with 01
    const cleanPhone = phone.trim().replace(/\D/g, '');
    if (!/^01[0125][0-9]{8}$/.test(cleanPhone)) {
      setError('Please enter a valid 11-digit Egyptian phone number starting with 01 (e.g. 01012345678).');
      return;
    }

    // Validate email domain format
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (email.trim() && !emailRegex.test(email.trim())) {
      setError('Please enter a valid email address with a proper domain (e.g. candidate@gmail.com).');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave({
        fullName: fullName.trim(),
        phone: cleanPhone,
        email: email.trim() || `${cleanPhone}@candidate.redzagency.com`,
        residence: residence.trim(),
        experienceLevel,
        experienceDetails: experienceDetails.trim(),
      });
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to update candidate data.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Edit Candidate Application Data</h3>
            <p className="text-xs text-slate-500">
              Reference ID: <span className="font-mono text-red-600 font-bold">{candidate.referenceCode}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs">
              {error}
            </div>
          )}

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Full Name *</label>
            <div className="relative">
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full p-2.5 pl-8 rounded-lg border border-slate-300 focus:ring-2 focus:ring-red-500 bg-white text-xs"
              />
              <User className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Phone Number (11 digits) *</label>
              <div className="relative">
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="01012345678"
                  className="w-full p-2.5 pl-8 rounded-lg border border-slate-300 focus:ring-2 focus:ring-red-500 bg-white font-mono text-xs"
                />
                <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3" />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Email Address *</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="candidate@gmail.com"
                  className="w-full p-2.5 pl-8 rounded-lg border border-slate-300 focus:ring-2 focus:ring-red-500 bg-white text-xs"
                />
                <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3" />
              </div>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Residence Area *</label>
            <div className="relative">
              <input
                type="text"
                required
                value={residence}
                onChange={(e) => setResidence(e.target.value)}
                placeholder="Cairo - Nasr City"
                className="w-full p-2.5 pl-8 rounded-lg border border-slate-300 focus:ring-2 focus:ring-red-500 bg-white text-xs"
              />
              <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3" />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Experience Level *</label>
            <select
              value={experienceLevel}
              onChange={(e) => setExperienceLevel(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-red-500 bg-white font-medium text-xs"
            >
              <option value="Fresh Graduate / No Experience">Fresh Graduate / No Experience</option>
              <option value="1 - 6 Months">1 - 6 Months</option>
              <option value="6 - 12 Months">6 - 12 Months</option>
              <option value="1 - 2 Years">1 - 2 Years</option>
              <option value="2+ Years">2+ Years</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Experience Details / Previous Company</label>
            <input
              type="text"
              value={experienceDetails}
              onChange={(e) => setExperienceDetails(e.target.value)}
              placeholder="e.g. Concentrix - 7 months"
              className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-red-500 bg-white text-xs"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold transition-all shadow-md disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
