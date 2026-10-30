export type UserRole = 'admin' | 'account_manager' | 'unit_manager' | 'team_leader' | 'recruiter';

export interface User {
  id: string;
  username: string;
  password?: string;
  fullName: string;
  role: UserRole;
  email: string;
  phone: string;
  referralCode: string;
  active: boolean;
  createdAt: string;
  allowGoogleLogin?: boolean;
  teamLeaderId?: string;
  teamLeaderName?: string;
  unitManagerId?: string;
  unitManagerName?: string;
  accountManagerId?: string;
  accountManagerName?: string;
}

export interface InterviewSlot {
  id: string;
  day: string; // e.g. "الأحد 3 نوفمبر" or "Every Sunday"
  time: string; // e.g. "12:00 PM - 02:00 PM"
  mode?: 'In-Person' | 'Online (Google Meet/Teams)' | 'Phone Call';
  capacity?: number;
}

export interface CompanyOffer {
  id: string;
  title: string; // e.g. "خدمة عملاء إنجليزي C1 - حساب بريطاني"
  companyName: string; // e.g. "Vodafone UK"
  companyLogo?: string;
  industry: string; // e.g. "Call Center & BPO"
  location: string; // e.g. "المعادي، القاهرة"
  workType: 'On-site' | 'Hybrid' | 'Remote';
  salaryPackage: string; // e.g. "18,000 ج.م صافي + 3,000 بونص"
  workingHours: string; // e.g. "9 ساعات (شفتات متغيرة) - يومين إجازة"
  requirements: string[]; // e.g. ["خريجين مؤهل عالي فقط", "مستوى إنجليزي C1 / C2", "موقف محدد من التجنيد للذكور"]
  interviewSlots: InterviewSlot[];
  isAvailable: boolean;
  notes?: string;
  schedulingRules?: {
    allowedDays: number[]; // 0: Sun, 1: Mon, ..., 6: Sat
    startTime?: string; // "HH:mm"
    endTime?: string; // "HH:mm"
    mode?: 'In-Person' | 'Online' | 'Flexible';
  };
  createdAt: string;
}

export interface StatusConfig {
  id: string;
  key: string;
  labelAr: string;
  labelEn: string;
  color: string; // Hex or tailwind badge style
  category: 'pending' | 'voice' | 'interview' | 'accepted' | 'rejected' | 'training';
  isDefault?: boolean;
}

export interface StatusHistoryEntry {
  status: string;
  changedBy: string;
  changedByRole: UserRole | 'system';
  timestamp: string;
  note?: string;
}

export interface CandidateApplication {
  id: string;
  referenceCode: string; // e.g., "CAN-8921"
  fullName: string;
  phone: string;
  email: string;
  graduationStatus: 'graduated' | 'undergraduate' | 'student';
  isEgyptian: boolean;
  otherNationality?: string;
  residence: string; // e.g. "القاهرة - المعادي"
  companyId: string;
  companyName: string; // Locked from offer
  offerId: string;
  offerTitle: string;
  vocarooUrl: string; // Primary voice note (English)
  vocarooUrl2?: string; // Secondary voice note (Optional - for French, German, etc.)
  interviewSlotId: string;
  interviewSlotDetails: string; // e.g. "الأحد 12:00 ظهراً"
  recruiterId: string;
  recruiterName: string;
  recruiterCode: string;
  status: string; // StatusConfig key
  scheduledDate?: string; // ISO date-time string
  feedbackNotes?: string;
  recruiterNotes?: string;
  englishLevel?: 'B1' | 'B2' | 'C1' | 'Fluent' | 'Native';
  experienceLevel?: string; // e.g. "Fresh Graduate / No Experience", "1-6 Months", "6-12 Months", "1-2 Years", "2+ Years"
  experienceCategory?: string; // e.g. "Customer Service", "Tele-sales", "Technical Support", "Banking & Finance", "Other"
  experienceDetails?: string; // e.g. Previous companies, accounts, or role description
  statusHistory: StatusHistoryEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface RecruitmentMetrics {
  totalCandidates: number;
  upcomingInterviews: number;
  acceptedInterviews: number;
  voiceAccepted: number;
  inTraining: number;
  rejected: number;
  pendingFeedback: number;
  conversionRate: number;
}

export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  candidateId: string;
  candidateName: string;
  candidatePhone: string;
  companyName?: string;
  statusKey: string;
  type: 'voice_accepted' | 'upcoming_interview' | 'general';
  targetUserId?: string;
  read: boolean;
  scheduledDate?: string;
  createdAt: string;
}
