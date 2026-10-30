import React, { useState } from 'react';
import { X, Tag, Palette } from 'lucide-react';
import { StatusConfig } from '../types';

interface StatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (statusData: Partial<StatusConfig> & { labelAr: string; key?: string }) => void;
}

const PRESET_COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Emerald
  '#059669', // Dark Emerald
  '#EAB308', // Amber
  '#F97316', // Orange
  '#EF4444', // Red
  '#DC2626', // Dark Red
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#14B8A6', // Teal
  '#64748B', // Slate
];

export const StatusModal: React.FC<StatusModalProps> = ({ isOpen, onClose, onSave }) => {
  if (!isOpen) return null;

  const [label, setLabel] = useState('');
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);
  const [category, setCategory] = useState<'pending' | 'voice' | 'interview' | 'accepted' | 'rejected' | 'training'>('pending');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim()) return;

    onSave({
      labelAr: label.trim(),
      labelEn: label.trim(),
      key: label.trim(),
      color: selectedColor,
      category,
      isDefault: false,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center text-red-600">
              <Tag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Add Custom Pipeline Status</h3>
              <p className="text-xs text-slate-500">Create a new feedback state for tracking candidates</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Status Name *</label>
            <input
              type="text"
              required
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. Second Interview Scheduled / Contract Signed"
              className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Category Group</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white font-medium"
            >
              <option value="pending">Pending / Follow-up</option>
              <option value="voice">Voice Note Assessment</option>
              <option value="interview">Interview Scheduling</option>
              <option value="accepted">Accepted / Passed</option>
              <option value="training">In Training</option>
              <option value="rejected">Rejected / No Show</option>
            </select>
          </div>

          {/* Color Picker */}
          <div>
            <label className="block font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
              <Palette className="w-4 h-4 text-slate-500" />
              Badge Color
            </label>
            <div className="grid grid-cols-6 gap-2">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setSelectedColor(c)}
                  className={`h-8 rounded-lg flex items-center justify-center transition-all ${
                    selectedColor === c ? 'ring-2 ring-offset-2 ring-slate-900 scale-105' : 'hover:opacity-80'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="pt-2 border-t border-slate-100">
            <span className="text-[11px] text-slate-400 block mb-1">Live Badge Preview:</span>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-center">
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold border"
                style={{
                  backgroundColor: `${selectedColor}15`,
                  borderColor: `${selectedColor}40`,
                  color: selectedColor,
                }}
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: selectedColor }} />
                <span>{label.trim() || 'Status Preview'}</span>
              </span>
            </div>
          </div>

          {/* Footer */}
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
              Add Status
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
