import { User, UserRole } from '../types';

/**
 * Returns the list of UserRoles that the given userRole is authorized to create / invite.
 * 
 * Rules:
 * - Team Leader (تيم ليدر): Can add Recruiters.
 * - Unit Manager (اليونت مانجر): Can add Recruiters and Team Leaders.
 * - Account Manager (الاكونت مانجر): Can add all roles (Recruiter, Team Leader, Unit Manager, Account Manager, Admin).
 * - Admin (المدير / CEO): Can add all roles.
 */
export function getAllowedRolesToCreate(creatorRole?: UserRole): UserRole[] {
  if (!creatorRole) return [];

  switch (creatorRole) {
    case 'team_leader':
      return ['recruiter'];
    case 'unit_manager':
      return ['recruiter', 'team_leader'];
    case 'account_manager':
      return ['recruiter', 'team_leader', 'unit_manager', 'account_manager', 'admin'];
    case 'admin':
      return ['recruiter', 'team_leader', 'unit_manager', 'account_manager', 'admin'];
    default:
      return [];
  }
}

/**
 * Checks if a user has permission to create/add members.
 */
export function canAddTeamMembers(creatorRole?: UserRole): boolean {
  return ['team_leader', 'unit_manager', 'account_manager', 'admin'].includes(creatorRole || '');
}

/**
 * Friendly label for the Add Member button based on creator role.
 */
export function getAddMemberButtonLabel(creatorRole?: UserRole): { en: string; ar: string } {
  switch (creatorRole) {
    case 'team_leader':
      return { en: '+ Add Recruiter', ar: '+ إضافة ريكروتر' };
    case 'unit_manager':
      return { en: '+ Add Recruiter or Team Leader', ar: '+ إضافة ريكروتر أو ليدر' };
    case 'account_manager':
      return { en: '+ Add Member (All Roles)', ar: '+ إضافة عضو (كافة الرتب)' };
    case 'admin':
    default:
      return { en: '+ Add User Account', ar: '+ إضافة مستخدم جديد' };
  }
}

/**
 * Determines whether currentUser has permission to edit or manage targetUser.
 */
export function canManageUser(currentUser: User | null, targetUser: User): boolean {
  if (!currentUser) return false;
  if (currentUser.id === targetUser.id) return true; // Can edit own profile
  if (currentUser.role === 'admin') return true; // Admin manages all
  
  if (currentUser.role === 'account_manager') {
    // Account manager manages all except admin accounts
    return (targetUser.role as string) !== 'admin';
  }

  if (currentUser.role === 'unit_manager') {
    // Unit manager can manage team leaders & recruiters under their unit
    const isInMyUnit =
      targetUser.unitManagerId === currentUser.id ||
      targetUser.id === currentUser.id;
    const isAllowedRole = targetUser.role === 'recruiter' || targetUser.role === 'team_leader';
    return isInMyUnit && isAllowedRole;
  }

  if (currentUser.role === 'team_leader') {
    // Team leader can only manage recruiters under their team
    return (
      targetUser.role === 'recruiter' &&
      targetUser.teamLeaderId === currentUser.id
    );
  }

  return false;
}

/**
 * Determines whether currentUser has permission to delete or deactivate targetUser.
 */
export function canDeleteUser(currentUser: User | null, targetUser: User): boolean {
  if (!currentUser) return false;
  if (targetUser.role === 'admin') return false; // Admin accounts cannot be deleted
  if (currentUser.id === targetUser.id) return false; // Cannot delete oneself

  if (currentUser.role === 'admin') return true;

  if (currentUser.role === 'account_manager') {
    return true;
  }

  if (currentUser.role === 'unit_manager') {
    const isUnderUnit = targetUser.unitManagerId === currentUser.id;
    const isAllowedRole = targetUser.role === 'recruiter' || targetUser.role === 'team_leader';
    return isUnderUnit && isAllowedRole;
  }

  if (currentUser.role === 'team_leader') {
    return targetUser.role === 'recruiter' && targetUser.teamLeaderId === currentUser.id;
  }

  return false;
}
