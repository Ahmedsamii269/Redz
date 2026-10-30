import React, { useState } from 'react';
import { X, Plus, Trash2, Calendar, Building2, MapPin, DollarSign, Clock, Check } from 'lucide-react';
import { CompanyOffer, InterviewSlot } from '../types';

interface OfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  offerToEdit?: CompanyOffer | null;
  onSave: (offerData: Partial<CompanyOffer> & { title: string; companyName: string }) => void;
}

export const OfferModal: React.FC<OfferModalProps> = ({
  isOpen,
  onClose,
  offerToEdit,
  onSave,
}) => {
  if (!isOpen) return null;

  const [companyName, setCompanyName] = useState(offerToEdit?.companyName || '');
  const [title, setTitle] = useState(offerToEdit?.title || '');
  const [industry, setIndustry] = useState(offerToEdit?.industry || 'Call Center & Customer Service');
  const [location, setLocation] = useState(offerToEdit?.location || 'Nasr City, Cairo');
  const [workType, setWorkType] = useState<'On-site' | 'Hybrid' | 'Remote'>(offerToEdit?.workType || 'On-site');
  const [salaryPackage, setSalaryPackage] = useState(offerToEdit?.salaryPackage || '23,000 EGP Net + KPIs');
  const [workingHours, setWorkingHours] = useState(offerToEdit?.workingHours || '4:00 PM – 1:00 AM (US Shift) | Mon - Fri');
  const [requirementsText, setRequirementsText] = useState(
    offerToEdit?.requirements?.join('\n') || 'Advanced English level (C1)\nAt least 6 months of Customer Service / Call Center experience\nKnowledge of MS Office and CRM systems\nSocial & Medical Insurance'
  );
  const [notes, setNotes] = useState(offerToEdit?.notes || '');
  const [isAvailable, setIsAvailable] = useState(offerToEdit ? offerToEdit.isAvailable : true);

  // Interview Slots
  const [slots, setSlots] = useState<InterviewSlot[]>(
    offerToEdit?.interviewSlots && offerToEdit.interviewSlots.length > 0
      ? offerToEdit.interviewSlots
      : [
          { id: 'slot-1', day: 'Sunday to Thursday', time: '12:00 PM – 4:00 PM', mode: 'In-Person' },
          { id: 'slot-2', day: 'Mon & Wed', time: '1:00 PM – 3:30 PM', mode: 'In-Person' },
        ]
  );

  const [newSlotDay, setNewSlotDay] = useState('');
  const [newSlotTime, setNewSlotTime] = useState('');

  const handleAddSlot = () => {
    if (!newSlotDay.trim() || !newSlotTime.trim()) return;
    const newSlot: InterviewSlot = {
      id: `slot-${Date.now()}`,
      day: newSlotDay.trim(),
      time: newSlotTime.trim(),
      mode: 'In-Person',
    };
    setSlots([...slots, newSlot]);
    setNewSlotDay('');
    setNewSlotTime('');
  };

  const handleRemoveSlot = (id: string) => {
    setSlots(slots.filter((s) => s.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim() || !title.trim()) return;

    const requirements = requirementsText
      .split('\n')
      .map((r) => r.trim())
      .filter(Boolean);

    onSave({
      id: offerToEdit?.id,
      companyName: companyName.trim(),
      title: title.trim(),
      industry: industry.trim(),
      location: location.trim(),
      workType,
      salaryPackage: salaryPackage.trim(),
      workingHours: workingHours.trim(),
      requirements,
      notes: notes.trim(),
      isAvailable,
      interviewSlots: slots,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center text-red-600">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                {offerToEdit ? 'Edit Company Offer & Slots' : 'Add New Company Job Offer'}
              </h3>
              <p className="text-xs text-slate-500">Configure job details, salary package, and interview scheduling</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* Company Name & Title */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Company Name *</label>
              <input
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Amend Business Solutions, Concentrix..."
                className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Role / Job Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Client Success Associate, UK Customer Support..."
                className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white"
              />
            </div>
          </div>

          {/* Salary Package & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Salary & Bonus Package *</label>
              <input
                type="text"
                required
                value={salaryPackage}
                onChange={(e) => setSalaryPackage(e.target.value)}
                placeholder="e.g. 23,000 EGP Net + Up to 5,000 KPI Bonus"
                className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Work Location *</label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Nasr City, Cairo / Maadi / New Cairo..."
                className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white"
              />
            </div>
          </div>

          {/* Work Type & Hours */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Work Arrangement</label>
              <select
                value={workType}
                onChange={(e) => setWorkType(e.target.value as any)}
                className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white"
              >
                <option value="On-site">On-site (Premises)</option>
                <option value="Hybrid">Hybrid</option>
                <option value="Remote">Remote</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Working Hours & Days Off</label>
              <input
                type="text"
                value={workingHours}
                onChange={(e) => setWorkingHours(e.target.value)}
                placeholder="e.g. 4:00 PM – 1:00 AM (US Shift) | Mon - Fri (Sat & Sun off)"
                className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white"
              />
            </div>
          </div>

          {/* Requirements */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Requirements & Benefits (one per line)
            </label>
            <textarea
              rows={4}
              value={requirementsText}
              onChange={(e) => setRequirementsText(e.target.value)}
              placeholder="e.g.&#10;Advanced English level (C1)&#10;At least 6 months of Customer Service / Call Center experience&#10;Social & Medical Insurance"
              className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white font-mono text-xs"
            />
          </div>

          {/* Interview Slots Section */}
          <div className="pt-2 border-t border-slate-100 space-y-2.5">
            <label className="block font-bold text-slate-900 text-xs flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-red-600" />
              Interview Appointment Slots for this Company *
            </label>
            <p className="text-[11px] text-slate-500">
              Candidates applying for this company will choose one of these scheduled slots.
            </p>

            <div className="space-y-2">
              {slots.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-200"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-slate-800">{s.day}</span>
                    <span className="text-slate-500 font-mono text-[11px]">{s.time}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveSlot(s.id)}
                    className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                    title="Remove slot"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add New Slot Row */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                placeholder="Day (e.g. Sunday to Thursday / Next Tuesday)"
                value={newSlotDay}
                onChange={(e) => setNewSlotDay(e.target.value)}
                className="flex-1 p-2 rounded-lg border border-slate-300 bg-white text-xs"
              />
              <input
                type="text"
                placeholder="Time (e.g. 1:00 PM – 4:00 PM)"
                value={newSlotTime}
                onChange={(e) => setNewSlotTime(e.target.value)}
                className="flex-1 p-2 rounded-lg border border-slate-300 bg-white text-xs"
              />
              <button
                type="button"
                onClick={handleAddSlot}
                disabled={!newSlotDay.trim() || !newSlotTime.trim()}
                className="px-3 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white rounded-lg font-semibold flex items-center gap-1 text-xs transition-colors shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Slot
              </button>
            </div>
          </div>

          {/* Availability Toggle */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <span className="font-semibold text-slate-700">Recruitment Availability</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isAvailable}
                onChange={(e) => setIsAvailable(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
              <span className="ml-2 font-medium text-xs text-slate-700">
                {isAvailable ? 'Active for Applications' : 'Temporarily Paused'}
              </span>
            </label>
          </div>

          {/* Footer Submit */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold transition-all shadow-md"
            >
              {offerToEdit ? 'Save Changes' : 'Publish Offer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
