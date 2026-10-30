import React, { useState } from 'react';
import { X, UserCheck, Key, Shield, User as UserIcon, Phone, Mail, Link as LinkIcon, Users } from 'lucide-react';
import { User, UserRole } from '../types';

interface RecruiterModalProps {
  isOpen: boolean;
  onClose: () => void;
  recruiterToEdit?: User | null;
  allUsers?: User[];
  onSave: (recruiterData: Partial<User> & { fullName: string; username: string }) => void;
}

export const RecruiterModal: React.FC<RecruiterModalProps> = ({
  isOpen,
  onClose,
  recruiterToEdit,
  allUsers = [],
  onSave,
}) => {
  if (!isOpen) return null;

  const [fullName, setFullName] = useState(recruiterToEdit?.fullName || '');
  const [username, setUsername] = useState(recruiterToEdit?.username || '');
  const [password, setPassword] = useState(recruiterToEdit?.password || '123456');
  const [email, setEmail] = useState(recruiterToEdit?.email || '');
  const [phone, setPhone] = useState(recruiterToEdit?.phone || '010');
  const [referralCode, setReferralCode] = useState(recruiterToEdit?.referralCode || '');
  const [role, setRole] = useState<UserRole>(recruiterToEdit?.role || 'recruiter');
  const [active, setActive] = useState(recruiterToEdit ? recruiterToEdit.active : true);
  const [allowGoogleLogin, setAllowGoogleLogin] = useState(recruiterToEdit?.allowGoogleLogin || false);

  const [teamLeaderId, setTeamLeaderId] = useState<string>(recruiterToEdit?.teamLeaderId || '');
  const [unitManagerId, setUnitManagerId] = useState<string>(recruiterToEdit?.unitManagerId || '');
  const [accountManagerId, setAccountManagerId] = useState<string>(recruiterToEdit?.accountManagerId || '');

  const availableTeamLeaders = allUsers.filter((u) => u.role === 'team_leader' && u.id !== recruiterToEdit?.id);
  const availableUnitManagers = allUsers.filter((u) => u.role === 'unit_manager' && u.id !== recruiterToEdit?.id);
  const availableAccountManagers = allUsers.filter((u) => u.role === 'account_manager' && u.id !== recruiterToEdit?.id);

  const handleTeamLeaderChange = (tlId: string) => {
    setTeamLeaderId(tlId);
    if (tlId) {
      const selectedTL = availableTeamLeaders.find((tl) => tl.id === tlId);
      if (selectedTL && selectedTL.unitManagerId) {
        setUnitManagerId(selectedTL.unitManagerId);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !username.trim()) return;

    const selectedTL = availableTeamLeaders.find((tl) => tl.id === teamLeaderId);
    const selectedUM = availableUnitManagers.find((um) => um.id === unitManagerId);
    const selectedAM = availableAccountManagers.find((am) => am.id === accountManagerId);

    onSave({
      id: recruiterToEdit?.id,
      fullName: fullName.trim(),
      username: username.trim(),
      password: password.trim(),
      email: email.trim() || `${username.trim()}@redzagency.com`,
      phone: phone.trim(),
      referralCode: referralCode.trim() || username.trim().toLowerCase().replace(/[^a-z0-9]/g, ''),
      role,
      active,
      allowGoogleLogin,
      teamLeaderId: role === 'recruiter' ? teamLeaderId || undefined : undefined,
      teamLeaderName: role === 'recruiter' && selectedTL ? selectedTL.fullName : undefined,
      unitManagerId: (role === 'recruiter' || role === 'team_leader') ? unitManagerId || undefined : undefined,
      unitManagerName: (role === 'recruiter' || role === 'team_leader') && selectedUM ? selectedUM.fullName : undefined,
      accountManagerId: (role === 'recruiter' || role === 'team_leader' || role === 'unit_manager') ? accountManagerId || undefined : undefined,
      accountManagerName: (role === 'recruiter' || role === 'team_leader' || role === 'unit_manager') && selectedAM ? selectedAM.fullName : undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center text-red-600">
              <UserIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                {recruiterToEdit ? 'Edit User Account' : 'Add New Team Member'}
              </h3>
              <p className="text-xs text-slate-500">
                Configure login credentials, role hierarchy, and tracking referral code
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* Full Name */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">User Full Name *</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Sarah Mohamed"
              className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white"
            />
          </div>

          {/* Username & Password */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Login Username *</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (!referralCode && !recruiterToEdit) {
                    setReferralCode(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''));
                  }
                }}
                placeholder="e.g. sarah_redz"
                className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Login Password *</label>
              <input
                type="text"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white font-mono"
              />
            </div>
          </div>

          {/* Referral Code */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Unique Referral Code *</label>
            <input
              type="text"
              required
              value={referralCode}
              onChange={(e) => setReferralCode(e.target.value)}
              placeholder="e.g. sarah_recruiter"
              className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white font-mono"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Appended to referral links (?ref=code) so candidate submissions automatically route to this account.
            </p>
          </div>

          {/* Phone & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="010xxxxxxxx"
                className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@redzagency.com"
                className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white"
              />
            </div>
          </div>

          {/* Role, Active Status & Google Login */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-100">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">System Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white font-medium"
              >
                <option value="recruiter">Recruiter</option>
                <option value="team_leader">Team Leader 👥</option>
                <option value="unit_manager">Unit Manager 🏢</option>
                <option value="account_manager">Account Manager</option>
                <option value="admin">Admin / CEO</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Status</label>
              <select
                value={active ? 'true' : 'false'}
                onChange={(e) => setActive(e.target.value === 'true')}
                className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white font-medium"
              >
                <option value="true">Active</option>
                <option value="false">Suspended</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Allow Google Login</label>
              <div className="flex items-center h-10">
                <input
                  type="checkbox"
                  checked={allowGoogleLogin}
                  onChange={(e) => setAllowGoogleLogin(e.target.checked)}
                  className="w-5 h-5 text-red-600 rounded focus:ring-red-500"
                />
              </div>
            </div>
          </div>

          {/* Hierarchy Options (Team Leader & Unit Manager) */}
          {role === 'recruiter' && (
            <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-lg space-y-3">
              <span className="font-bold text-indigo-900 block flex items-center gap-1.5 text-xs">
                <Users className="w-4 h-4 text-indigo-600" />
                Assign Team Hierarchy (Team Leader, Unit Manager, Account Manager)
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Assigned Team Leader</label>
                  <select
                    value={teamLeaderId}
                    onChange={(e) => handleTeamLeaderChange(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-300 bg-white text-xs"
                  >
                    <option value="">-- No Team Leader --</option>
                    {availableTeamLeaders.map((tl) => (
                      <option key={tl.id} value={tl.id}>
                        {tl.fullName} (@{tl.referralCode})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Assigned Unit Manager</label>
                  <select
                    value={unitManagerId}
                    onChange={(e) => setUnitManagerId(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-300 bg-white text-xs"
                  >
                    <option value="">-- No Unit Manager --</option>
                    {availableUnitManagers.map((um) => (
                      <option key={um.id} value={um.id}>
                        {um.fullName} (@{um.referralCode})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Assigned Account Manager</label>
                  <select
                    value={accountManagerId}
                    onChange={(e) => setAccountManagerId(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-300 bg-white text-xs"
                  >
                    <option value="">-- No Account Manager --</option>
                    {availableAccountManagers.map((am) => (
                      <option key={am.id} value={am.id}>
                        {am.fullName} (@{am.referralCode})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {role === 'team_leader' && (
            <div className="p-3 bg-purple-50/70 border border-purple-100 rounded-lg space-y-3">
              <label className="block font-semibold text-purple-900 text-xs">
                Assign Unit Manager & Account Manager for this Team Leader
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <select
                  value={unitManagerId}
                  onChange={(e) => setUnitManagerId(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-300 bg-white text-xs"
                >
                  <option value="">-- No Unit Manager --</option>
                  {availableUnitManagers.map((um) => (
                    <option key={um.id} value={um.id}>
                      {um.fullName} (@{um.referralCode})
                    </option>
                  ))}
                </select>
                <select
                  value={accountManagerId}
                  onChange={(e) => setAccountManagerId(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-300 bg-white text-xs"
                >
                  <option value="">-- No Account Manager --</option>
                  {availableAccountManagers.map((am) => (
                    <option key={am.id} value={am.id}>
                      {am.fullName} (@{am.referralCode})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {role === 'unit_manager' && (
            <div className="p-3 bg-amber-50/70 border border-amber-100 rounded-lg space-y-2">
              <label className="block font-semibold text-amber-900 text-xs">
                Assign Account Manager for this Unit Manager
              </label>
              <select
                value={accountManagerId}
                onChange={(e) => setAccountManagerId(e.target.value)}
                className="w-full p-2 rounded-lg border border-slate-300 bg-white text-xs"
              >
                <option value="">-- No Account Manager --</option>
                {availableAccountManagers.map((am) => (
                  <option key={am.id} value={am.id}>
                    {am.fullName} (@{am.referralCode})
                  </option>
                ))}
              </select>
            </div>
          )}

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
              {recruiterToEdit ? 'Save Changes' : 'Create Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
