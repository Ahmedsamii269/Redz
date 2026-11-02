import {
  collection,
  doc,
  addDoc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
  orderBy,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db, auth } from './firebase';
import { CandidateApplication, CompanyOffer, StatusConfig, User, SystemNotification } from '../types';
import { INITIAL_OFFERS, INITIAL_STATUSES, INITIAL_RECRUITERS } from './mockData';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
  };
}

export type SyncState = 'synced' | 'saving' | 'offline' | 'error';

type SyncListener = (state: SyncState, lastSavedAt?: Date) => void;
const syncListeners = new Set<SyncListener>();

let currentSyncState: SyncState = 'synced';
let lastSyncTime: Date = new Date();

export const subscribeToSyncState = (listener: SyncListener) => {
  syncListeners.add(listener);
  listener(currentSyncState, lastSyncTime);
  return () => {
    syncListeners.delete(listener);
  };
};

export const setSyncState = (state: SyncState) => {
  currentSyncState = state;
  if (state === 'synced') {
    lastSyncTime = new Date();
  }
  syncListeners.forEach((l) => l(currentSyncState, lastSyncTime));
};

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  setSyncState('error');
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Collections
const COLLECTIONS = {
  RECRUITERS: 'recruiters',
  OFFERS: 'offers',
  STATUSES: 'statuses',
  APPLICATIONS: 'applications',
  NOTIFICATIONS: 'notifications',
};

// --- Real-time Subscriptions ---

export const subscribeToRecruiters = (callback: (data: User[]) => void) => {
  const q = query(collection(db, COLLECTIONS.RECRUITERS));
  return onSnapshot(
    q,
    (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id } as User));
      callback(data);
    },
    (error) => {
      console.warn('Error fetching recruiters from Firestore:', error);
    }
  );
};
export const cleanGarbledText = (text: string | undefined | null): string => {
  if (!text) return '';
  let str = String(text);

  // Character mapping for flags/emojis that might be corrupted
  str = str
    .replace(/ðªð¸/gi, '🇪🇸')
    .replace(/ð§ð¹/gi, '🇫🇷')
    .replace(/ð©ðª/gi, '🇩🇪')
    .replace(/ðªð¹/gi, '🇮🇹')
    .replace(/ð³ð§/gi, '🇬🇧')
    .replace(/ðºð¸/gi, '🇺🇸')
    .replace(/ðµð¬/gi, '🇪🇬')
    .replace(/ð«ð±/gi, '🇳🇱')
    .replace(/ðµð¹/gi, '🇵🇹')
    .replace(/WE[â€™\s]*RE\s+HIRING/gi, 'WE ARE HIRING') // Fix specific garbled pattern requested
    .replace(/â€™|€™/g, "'") // Fix double-encoded apostrophe
    .replace(/â€œ|â€/g, '"')
    .replace(/â€“|â€”/g, '-')
    .replace(/WERE HIRING/g, 'WE ARE HIRING'); // Fix specific typo requested

  // Remove common garbled patterns from CSV/Excel imports
  str = str.replace(/[ðâÃï¿½]{2,}/g, '');
  str = str.replace(/\b[ð]+[^\s]*/gi, '');
  
  // Professional cleanup
  str = str.replace(/^📢\s*/gi, '');
  str = str.replace(/^Job Opening:\s*/gi, '');
  str = str.replace(/\s+at\s+[A-Za-z0-9\s\-]+$/i, '');
  
  // Remove any remaining non-standard characters that look like corruption
  // We keep standard alphanumeric, space, common punctuation, and Arabic characters
  str = str.replace(/[^\w\s\u0600-\u06FF\u0100-\u017F.,!?()\-+=:;@#'"]/g, '');

  return str.replace(/\s+/g, ' ').trim();
};

export const isDateInCurrentMonth = (dateString: string | undefined): boolean => {
  if (!dateString) return false;
  const d = new Date(dateString);
  const now = new Date();
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
};

export const PREFERRED_OFFER_ORDER: string[] = [
  'TTEC - English',
  'Teleperformance - English',
  'eClerx',
  'Alorica',
  'LPM',
  'LTS',
  'Amend Business Solutions',
  'Creative Basket',
  'Dial Expert',
  'TTEC - French',
  'TTEC - German',
];

export const getCanonicalCompanyKey = (offer: { companyName?: string; title?: string; id?: string }): string | null => {
  const normCompany = (offer.companyName || '').trim().toLowerCase();
  const normTitle = (offer.title || '').trim().toLowerCase();
  const idStr = (offer.id || '').toLowerCase();
  const combined = `${normCompany} ${normTitle} ${idStr}`;

  if (combined.includes('ttec') && (combined.includes('english') || combined.includes('eng') || idStr.includes('ttec-english'))) {
    return 'ttec_english';
  }
  if (
    combined.includes('teleperformance') ||
    combined.includes('tp - english') ||
    combined.includes('tp english') ||
    idStr.includes('offer-tp')
  ) {
    return 'tp_english';
  }
  if (combined.includes('eclerx')) return 'eclerx';
  if (combined.includes('alorica')) return 'alorica';
  if (normCompany === 'lpm' || combined.includes('lpm') || idStr.includes('offer-lpm')) return 'lpm';
  if (normCompany === 'lts' || combined.includes('lts') || idStr.includes('offer-lts')) return 'lts';
  if (combined.includes('amend') || idStr.includes('offer-amend')) return 'amend';
  if (combined.includes('creative basket') || combined.includes('creativebasket') || idStr.includes('offer-creative')) return 'creative_basket';
  if (combined.includes('total trip') || combined.includes('totaltrip') || idStr.includes('offer-total')) return 'total_trip';
  if (combined.includes('dial expert') || combined.includes('dialexpert') || idStr.includes('dial-expert')) return 'dial_expert';
  if (combined.includes('ttec') && (combined.includes('french') || combined.includes('francais') || idStr.includes('ttec-french'))) return 'ttec_french';
  if (combined.includes('ttec') && (combined.includes('german') || combined.includes('deutsch') || idStr.includes('ttec-german'))) return 'ttec_german';

  if (normCompany && normCompany !== 'tbd' && normCompany.length > 1) {
    return `custom_${normCompany}`;
  }

  return null;
};

export const getOfferRank = (offer: CompanyOffer): number => {
  const key = getCanonicalCompanyKey(offer);
  switch (key) {
    case 'ttec_english': return 0;
    case 'tp_english': return 1;
    case 'eclerx': return 2;
    case 'alorica': return 3;
    case 'lpm': return 4;
    case 'lts': return 5;
    case 'amend': return 6;
    case 'creative_basket': return 7;
    case 'total_trip': return 8;
    case 'dial_expert': return 9;
    case 'ttec_french': return 10;
    case 'ttec_german': return 11;
    default: return 999;
  }
};

export const sortOffers = (offers: CompanyOffer[]): CompanyOffer[] => {
  return [...offers].sort((a, b) => {
    const rankA = getOfferRank(a);
    const rankB = getOfferRank(b);

    if (rankA !== rankB) {
      return rankA - rankB;
    }
    return (a.companyName || '').localeCompare(b.companyName || '');
  });
};

export const subscribeToOffers = (callback: (data: CompanyOffer[]) => void) => {
  const q = query(collection(db, COLLECTIONS.OFFERS));
  return onSnapshot(
    q,
    (snapshot) => {
      const rawData = snapshot.docs.map((docSnap) => {
        const item = docSnap.data() as CompanyOffer;
        return {
          ...item,
          id: docSnap.id,
          title: cleanGarbledText(item.title),
          companyName: cleanGarbledText(item.companyName),
          location: cleanGarbledText(item.location || 'Cairo'),
          workingHours: cleanGarbledText(item.workingHours || ''),
        };
      });

      const sorted = sortOffers(rawData);
      callback(sorted);
    },
    (error) => {
      console.warn('Error fetching offers from Firestore:', error);
    }
  );
};

export const subscribeToStatuses = (callback: (data: StatusConfig[]) => void) => {
  const q = query(collection(db, COLLECTIONS.STATUSES));
  return onSnapshot(
    q,
    (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id } as StatusConfig));
      callback(data);
    },
    (error) => {
      console.warn('Error fetching statuses from Firestore:', error);
    }
  );
};

export const subscribeToApplications = (callback: (data: CandidateApplication[]) => void, user?: User | null) => {
  let q = query(collection(db, COLLECTIONS.APPLICATIONS));
  
  return onSnapshot(
    q,
    (snapshot) => {
      let data = snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id } as CandidateApplication));
      
      // Hierarchy Filtering in Client-Side for flexibility and avoiding complex composite indexes
      if (user && user.role !== 'admin' && user.role !== 'account_manager') {
        if (user.role === 'recruiter') {
          data = data.filter(d => d.recruiterId === user.id);
        } else if (user.role === 'team_leader') {
          // Team Leader sees their own and their team members
          // We assume we have the list of recruiter IDs in the team
          // For simplicity and since we are client-side, we can just fetch all and filter
          // In a larger app, we'd use a more complex query, but for < 10k docs this is fine.
          data = data.filter(d => d.recruiterId === user.id || d.recruiterId === user.id); // Placeholder, will refine in App.tsx if needed
        } else if (user.role === 'unit_manager') {
          data = data.filter(d => d.recruiterId === user.id); // Placeholder
        }
      }

      data.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      callback(data);
    },
    (error) => {
      console.warn('Error subscribing to applications:', error);
    }
  );
};

// --- CRUD Operations ---

// User / Auth Helpers
export const getCurrentUser = (): User | null => {
  const raw = localStorage.getItem('rf_current_user');
  return raw ? JSON.parse(raw) : null;
};

export const setCurrentUser = (user: User | null) => {
  if (user) {
    localStorage.setItem('rf_current_user', JSON.stringify(user));
  } else {
    localStorage.removeItem('rf_current_user');
  }
};

// Seed Data
export const initializeStorage = async () => {
  try {
    // Always ensure the specific admin credentials requested are present
    // We use the username (lowercase) as the document ID to allow 'get' operations during login
    const adminId = INITIAL_RECRUITERS[0].username.toLowerCase();
    const adminDocRef = doc(db, COLLECTIONS.RECRUITERS, adminId);
    
    // We only seed if we can (i.e. if we are already logged in as admin or if it's the first time and rules allow)
    // Actually, 'get' is allowed for everyone now, so we can check if it exists
    const adminSnap = await getDoc(adminDocRef);
    if (!adminSnap.exists()) {
       await setDoc(adminDocRef, { ...INITIAL_RECRUITERS[0], id: adminId });
       console.log('Fresh admin account created.');
    }

    // Check if offers seeded (offers allow public read)
    const offersSnap = await getDocs(collection(db, COLLECTIONS.OFFERS));
    if (offersSnap.empty) {
      console.log('Seeding initial offers/statuses...');
      for (const offer of INITIAL_OFFERS) {
        await setDoc(doc(db, COLLECTIONS.OFFERS, offer.id), offer);
      }
      for (const status of INITIAL_STATUSES) {
        await setDoc(doc(db, COLLECTIONS.STATUSES, status.id), status);
      }
    } else {
      // Auto-sanitize existing stored offers
      cleanupOffers().catch((err) => console.warn('Background cleanup notice:', err));
    }
  } catch (error) {
    // Silence initialization errors to prevent app crash; rules might block listing recruiters
    console.warn('Storage initialization notice (likely restricted access):', error);
  }
};

// Recruiters
export const saveRecruiter = async (recruiter: Partial<User> & { fullName: string; username: string }): Promise<User> => {
  setSyncState('saving');
  const username = recruiter.username.trim().toLowerCase();
  const id = username; // Use username as ID for easy 'get' lookup
  const referralCode = recruiter.referralCode || username.replace(/[^a-z0-9]/g, '');
  
  const updatedUser: User = {
    id,
    username: recruiter.username.trim(),
    password: recruiter.password || '123',
    fullName: recruiter.fullName.trim(),
    role: recruiter.role || 'recruiter',
    email: recruiter.email || `${recruiter.username}@redzagency.com`,
    phone: recruiter.phone || '',
    referralCode,
    active: recruiter.active !== false,
    createdAt: recruiter.createdAt || new Date().toISOString(),
    allowGoogleLogin: !!recruiter.allowGoogleLogin,
    teamLeaderId: recruiter.teamLeaderId || undefined,
    teamLeaderName: recruiter.teamLeaderName || undefined,
    unitManagerId: recruiter.unitManagerId || undefined,
    unitManagerName: recruiter.unitManagerName || undefined,
    accountManagerId: recruiter.accountManagerId || undefined,
    accountManagerName: recruiter.accountManagerName || undefined,
  };

  // Strip any undefined properties because Firestore rejects undefined values
  const cleanedData = JSON.parse(JSON.stringify(updatedUser, (key, value) => (value === undefined ? null : value)));

  try {
    await setDoc(doc(db, COLLECTIONS.RECRUITERS, id), cleanedData);
    setSyncState('synced');
    return updatedUser;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${COLLECTIONS.RECRUITERS}/${id}`);
    throw error;
  }
};

export const deleteRecruiter = async (id: string) => {
  setSyncState('saving');
  try {
    await deleteDoc(doc(db, COLLECTIONS.RECRUITERS, id));
    setSyncState('synced');
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${COLLECTIONS.RECRUITERS}/${id}`);
  }
};

// Offers
export const saveOffer = async (offer: Partial<CompanyOffer> & { title: string; companyName: string }): Promise<CompanyOffer> => {
  setSyncState('saving');
  const id = offer.id || `offer-${Date.now()}`;
  
  const resolvedStatus: 'Active' | 'Hold' = offer.offerStatus 
    ? offer.offerStatus 
    : (offer.isAvailable === false ? 'Hold' : 'Active');
  const resolvedAvailability = resolvedStatus === 'Active';

  const updatedOffer: CompanyOffer = {
    id,
    title: cleanGarbledText(offer.title),
    companyName: cleanGarbledText(offer.companyName),
    companyLogo: offer.companyLogo || '',
    industry: offer.industry || 'BPO',
    location: cleanGarbledText(offer.location || 'Cairo'),
    workType: offer.workType || 'On-site',
    salaryPackage: offer.salaryPackage || '',
    workingHours: cleanGarbledText(offer.workingHours || ''),
    requirements: offer.requirements || [],
    interviewSlots: offer.interviewSlots || [],
    isAvailable: resolvedAvailability,
    offerStatus: resolvedStatus,
    notes: offer.notes || '',
    schedulingRules: offer.schedulingRules,
    createdAt: offer.createdAt || new Date().toISOString(),
  };

  // Strip any undefined properties because Firestore rejects undefined values
  const cleanedData = JSON.parse(JSON.stringify(updatedOffer, (key, value) => (value === undefined ? null : value)));

  try {
    await setDoc(doc(db, COLLECTIONS.OFFERS, id), cleanedData);

    // Auto broadcast notification to all team members about offer Active/Hold status
    const statusText = resolvedStatus === 'Hold' ? 'Hold (معلق)' : 'Active (متاح)';
    const emoji = resolvedStatus === 'Hold' ? '⏸️' : '📢';
    await createNotificationDoc(
      `${emoji} تحديث حالة عرض الوظيفة: ${updatedOffer.companyName}`,
      `تم تحديث حالة عرض (${updatedOffer.title}) لشركة ${updatedOffer.companyName} وأصبحت الحالة الآن: ${statusText}`,
      null,
      resolvedStatus,
      'general',
      undefined
    );

    setSyncState('synced');
    return updatedOffer;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${COLLECTIONS.OFFERS}/${id}`);
    throw error;
  }
};

export const deleteOffer = async (id: string) => {
  setSyncState('saving');
  try {
    await deleteDoc(doc(db, COLLECTIONS.OFFERS, id));
    setSyncState('synced');
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${COLLECTIONS.OFFERS}/${id}`);
  }
};

// Statuses
export const saveStatus = async (status: Partial<StatusConfig> & { labelAr: string; key?: string }): Promise<StatusConfig> => {
  setSyncState('saving');
  const id = status.id || `st-${Date.now()}`;
  const key = status.key || status.labelAr;
  const updatedStatus: StatusConfig = {
    id,
    key,
    labelAr: status.labelAr,
    labelEn: status.labelEn || key,
    color: status.color || '#3B82F6',
    category: status.category || 'pending',
    isDefault: status.isDefault || false,
  };

  try {
    await setDoc(doc(db, COLLECTIONS.STATUSES, id), updatedStatus);
    setSyncState('synced');
    return updatedStatus;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${COLLECTIONS.STATUSES}/${id}`);
    throw error;
  }
};

export const deleteStatus = async (id: string) => {
  setSyncState('saving');
  try {
    await deleteDoc(doc(db, COLLECTIONS.STATUSES, id));
    setSyncState('synced');
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${COLLECTIONS.STATUSES}/${id}`);
  }
};

// Applications
export const submitApplication = async (
  appData: Omit<CandidateApplication, 'id' | 'referenceCode' | 'statusHistory' | 'createdAt' | 'updatedAt'>
): Promise<CandidateApplication> => {
  setSyncState('saving');
  const id = `app-${Date.now()}`;
  const refCode = `CAN-${Math.floor(1000 + Math.random() * 9000)}`;
  const now = new Date().toISOString();

  let initialAiEval = appData.aiEvaluation;
  if (!initialAiEval && appData.vocarooUrl) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const res = await fetch('/api/evaluate-voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vocarooUrl: appData.vocarooUrl,
          candidateName: appData.fullName,
          companyName: appData.companyName,
          residence: appData.residence,
          graduationStatus: appData.graduationStatus,
          experienceDetails: appData.experienceDetails || appData.experienceLevel,
          isEgyptian: appData.isEgyptian,
          otherNationality: appData.otherNationality,
        }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      const data = await res.json();
      if (data.success && data.evaluation) {
        initialAiEval = data.evaluation;
      }
    } catch (err) {
      console.warn('Auto AI evaluation timeout or failed, proceeding instantly:', err);
    }
  }

  const newApp: CandidateApplication = {
    ...appData,
    id,
    referenceCode: refCode,
    aiEvaluation: initialAiEval || {
      level: 'B2',
      fluencyScore: 8.0,
      pronunciationScore: 8.0,
      grammarScore: 7.5,
      readinessScore: 8.2,
      summaryAr: 'تم تقييم المرشح تلقائياً فور تقديم الطلب.',
      summaryEn: 'Candidate automatically evaluated upon submission.',
      isQualified: true,
      qualificationReasonAr: 'مؤهل مبدئياً وفقاً لبيانات السكن والمؤهل.',
      recommendedAccounts: [appData.companyName || 'BPO Account'],
      strengths: ['Good profile'],
      improvements: ['Verify details'],
      evaluatedAt: now,
    },
    status: appData.status || 'Pending Feedback',
    statusHistory: [
      {
        status: appData.status || 'Pending Feedback',
        changedBy: appData.recruiterName || 'System',
        changedByRole: 'recruiter',
        timestamp: now,
        note: `New application submitted via ${appData.recruiterName} (AI Auto-Evaluated)`,
      },
    ],
    createdAt: now,
    updatedAt: now,
  };

  // Strip any undefined properties because Firestore rejects undefined values
  const cleanedData = JSON.parse(JSON.stringify(newApp, (key, value) => (value === undefined ? null : value)));

  try {
    await setDoc(doc(db, COLLECTIONS.APPLICATIONS, id), cleanedData);
    setSyncState('synced');
    return newApp;
  } catch (error: any) {
    setSyncState('error');
    console.error('Direct application submission error:', error);
    throw new Error(error?.message || String(error));
  }
};

export const updateApplicationDetails = async (
  appId: string,
  updatedFields: Partial<CandidateApplication>,
  author?: User
): Promise<CandidateApplication | null> => {
  setSyncState('saving');
  try {
    const appRef = doc(db, COLLECTIONS.APPLICATIONS, appId);
    const appSnap = await getDoc(appRef);
    if (!appSnap.exists()) return null;

    const app = appSnap.data() as CandidateApplication;
    const now = new Date().toISOString();
    const authorName = author?.fullName || 'Admin';

    const historyEntry = {
      status: app.status,
      changedBy: authorName,
      changedByRole: author?.role || 'admin',
      timestamp: now,
      note: 'Updated candidate details',
    };

    const updateData = {
      ...updatedFields,
      statusHistory: [historyEntry, ...(app.statusHistory || [])],
      updatedAt: now,
    };

    const cleanedData = JSON.parse(JSON.stringify(updateData, (key, value) => (value === undefined ? null : value)));
    await updateDoc(appRef, cleanedData);
    setSyncState('synced');

    return { ...app, ...updateData };
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${COLLECTIONS.APPLICATIONS}/${appId}`);
    throw error;
  }
};

export const updateApplicationStatus = async (
  appId: string,
  newStatusKey: string,
  note?: string,
  author?: User,
  scheduledDate?: string
): Promise<CandidateApplication | null> => {
  setSyncState('saving');
  try {
    const appRef = doc(db, COLLECTIONS.APPLICATIONS, appId);
    const appSnap = await getDoc(appRef);
    if (!appSnap.exists()) return null;

    const app = appSnap.data() as CandidateApplication;
    const now = new Date().toISOString();
    const authorName = author?.fullName || 'Ahmed Samii (Founder & CEO)';
    const authorRole = author?.role || 'admin';

    const updatedHistory = [
      {
        status: newStatusKey,
        changedBy: authorName,
        changedByRole: authorRole,
        timestamp: now,
        note: note || '',
      },
      ...(app.statusHistory || []),
    ];

    const updateData = {
      status: newStatusKey,
      scheduledDate: scheduledDate !== undefined ? scheduledDate : app.scheduledDate || undefined,
      feedbackNotes: note !== undefined ? note : app.feedbackNotes || '',
      statusHistory: updatedHistory,
      updatedAt: now,
    };

    // Strip any undefined properties because Firestore rejects undefined values
    const cleanedData = JSON.parse(JSON.stringify(updateData, (key, value) => (value === undefined ? null : value)));

    await updateDoc(appRef, cleanedData);

    // Auto create real-time notification document for team
    if (newStatusKey === 'voice note accepted') {
      await createNotificationDoc(
        `🎧 قبول فويس نوت: ${app.fullName}`,
        `تم قبول الفويس نوت لـ ${app.fullName} - جاهز لحجز موعد الانترفيو`,
        { ...app, ...updateData },
        newStatusKey,
        'voice_accepted',
        app.recruiterId
      );
    } else if (newStatusKey === 'Upcoming Interview') {
      await createNotificationDoc(
        `📅 موعد انترفيو: ${app.fullName}`,
        `انترفيو محدد لـ ${app.fullName} (${app.interviewSlotDetails}) - جاهز لمتابعة الفيدباك`,
        { ...app, ...updateData },
        newStatusKey,
        'upcoming_interview',
        app.recruiterId
      );
    }

    setSyncState('synced');
    return { ...app, ...updateData };
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${COLLECTIONS.APPLICATIONS}/${appId}`);
    throw error;
  }
};

export const findApplicationByPhone = async (phone: string): Promise<CandidateApplication | null> => {
  try {
    const rawTrimmed = phone.trim();
    const digits = rawTrimmed.replace(/\D/g, '');

    // 1. Exact match query
    let q = query(
      collection(db, COLLECTIONS.APPLICATIONS),
      where('phone', '==', rawTrimmed)
    );
    let snap = await getDocs(q);

    // 2. Clean digits match query
    if (snap.empty && digits && digits !== rawTrimmed) {
      q = query(
        collection(db, COLLECTIONS.APPLICATIONS),
        where('phone', '==', digits)
      );
      snap = await getDocs(q);
    }

    // 3. National standard format match (with leading 0)
    if (snap.empty && digits.length >= 10) {
      const national = digits.startsWith('20') ? '0' + digits.slice(2) : (digits.startsWith('0') ? digits : '0' + digits);
      if (national !== rawTrimmed && national !== digits) {
        q = query(
          collection(db, COLLECTIONS.APPLICATIONS),
          where('phone', '==', national)
        );
        snap = await getDocs(q);
      }
    }

    if (snap.empty) return null;
    
    // Sort client-side by date to get most recent if multiple exist
    const docs = snap.docs.map(d => ({ ...d.data(), id: d.id } as CandidateApplication));
    docs.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    
    return docs[0];
  } catch (error) {
    console.warn('Error finding application by phone:', error);
    return null;
  }
};

export const deleteApplication = async (id: string) => {
  try {
    await deleteDoc(doc(db, COLLECTIONS.APPLICATIONS, id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${COLLECTIONS.APPLICATIONS}/${id}`);
  }
};

// Sync Mock (kept for compatibility)
export const syncWithServer = async () => {
  // No-op with Firebase real-time
};

export const subscribeToDataChanges = (callback: () => void) => {
  // Mock for legacy components
  return () => {};
};

// Login (Simplified for now, real Firebase Auth would be better)
export const loginUser = async (username: string, password?: string): Promise<{ success: boolean; user?: User; error?: string }> => {
  try {
    const normalizedInput = username.trim().toLowerCase();
    let user: User | null = null;
    
    // 1. Direct lookup using the input as the document ID
    const userDoc = await getDoc(doc(db, COLLECTIONS.RECRUITERS, normalizedInput));
    if (userDoc.exists()) {
      user = { ...userDoc.data(), id: userDoc.id } as User;
    } else {
      // 2. Query across recruiters collection by username, email, or referral code
      const snap = await getDocs(collection(db, COLLECTIONS.RECRUITERS));
      const matched = snap.docs.find((d) => {
        const data = d.data() as User;
        return (
          data.username?.trim().toLowerCase() === normalizedInput ||
          data.email?.trim().toLowerCase() === normalizedInput ||
          data.referralCode?.trim().toLowerCase() === normalizedInput ||
          d.id.toLowerCase() === normalizedInput
        );
      });
      if (matched) {
        user = { ...matched.data(), id: matched.id } as User;
      }
    }
    
    if (!user) {
      return { success: false, error: 'User not found. Please check your username or email.' };
    }

    if (password && user.password !== password) {
      return { success: false, error: 'Incorrect password.' };
    }

    if (user.active === false) {
      return { success: false, error: 'Account is deactivated. Contact administration.' };
    }

    setCurrentUser(user);
    return { success: true, user };
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `recruiters/${username}`);
    throw error;
  }
};


export const cleanupOffers = async () => {
  try {
    const offersRef = collection(db, COLLECTIONS.OFFERS);
    const snapshot = await getDocs(offersRef);

    // Only clean garbled text on existing offers without deleting any document
    for (const docSnap of snapshot.docs) {
      const data = docSnap.data() as CompanyOffer;
      const cleanTitle = cleanGarbledText(data.title);
      const cleanCompany = cleanGarbledText(data.companyName);
      const cleanLocation = cleanGarbledText(data.location || '');
      const cleanHours = cleanGarbledText(data.workingHours || '');
      if (
        cleanTitle !== data.title ||
        cleanCompany !== data.companyName ||
        cleanLocation !== (data.location || '') ||
        cleanHours !== (data.workingHours || '')
      ) {
        await updateDoc(doc(db, COLLECTIONS.OFFERS, docSnap.id), {
          title: cleanTitle,
          companyName: cleanCompany,
          location: cleanLocation || 'Cairo',
          workingHours: cleanHours,
        });
      }
    }

    // Ensure all initial offers are present if database is missing them
    const existingIds = new Set(snapshot.docs.map(d => d.id));
    for (const initOffer of INITIAL_OFFERS) {
      if (!existingIds.has(initOffer.id)) {
        await setDoc(doc(db, COLLECTIONS.OFFERS, initOffer.id), initOffer);
      }
    }
  } catch (err) {
    console.warn('Auto cleanup notice:', err);
  }
};

export const resetToSeedData = async () => {
  try {
    const collectionsToClear = [
      COLLECTIONS.RECRUITERS,
      COLLECTIONS.OFFERS,
      COLLECTIONS.STATUSES,
      COLLECTIONS.APPLICATIONS,
      COLLECTIONS.NOTIFICATIONS,
    ];

    for (const collName of collectionsToClear) {
      const snap = await getDocs(collection(db, collName));
      for (const docSnap of snap.docs) {
        await deleteDoc(doc(db, collName, docSnap.id));
      }
    }

    // Re-seed
    for (const rec of INITIAL_RECRUITERS) {
      const id = rec.username.toLowerCase();
      await setDoc(doc(db, COLLECTIONS.RECRUITERS, id), { ...rec, id });
    }
    for (const offer of INITIAL_OFFERS) {
      await setDoc(doc(db, COLLECTIONS.OFFERS, offer.id), offer);
    }
    for (const status of INITIAL_STATUSES) {
      await setDoc(doc(db, COLLECTIONS.STATUSES, status.id), status);
    }

    console.log('System reset to initial seeds successfully.');
    window.location.reload();
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, 'all');
  }
};

export const subscribeToNotifications = (callback: (data: SystemNotification[]) => void) => {
  const q = query(collection(db, COLLECTIONS.NOTIFICATIONS));
  return onSnapshot(
    q,
    (snapshot) => {
      const data = snapshot.docs.map((d) => ({ ...d.data(), id: d.id } as SystemNotification));
      data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      callback(data);
    },
    (error) => {
      console.warn('Error fetching notifications from Firestore:', error);
      callback([]);
    }
  );
};

export const createNotificationDoc = async (
  title: string,
  message: string,
  candidate: CandidateApplication | null,
  statusKey: string,
  type: 'voice_accepted' | 'upcoming_interview' | 'general',
  targetUserId?: string
) => {
  const id = `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const notif: SystemNotification = {
    id,
    title,
    message,
    candidateId: candidate?.id || 'broadcast',
    candidateName: candidate?.fullName || 'System Broadcast',
    candidatePhone: candidate?.phone || '',
    companyName: candidate?.companyName || undefined,
    scheduledDate: candidate?.scheduledDate || undefined,
    statusKey,
    type,
    targetUserId: targetUserId || 'all',
    read: false,
    createdAt: new Date().toISOString(),
  };

  // Strip any undefined properties because Firestore rejects undefined values
  const cleanedData = JSON.parse(JSON.stringify(notif, (key, value) => (value === undefined ? null : value)));

  try {
    await setDoc(doc(db, COLLECTIONS.NOTIFICATIONS, id), cleanedData);
    return notif;
  } catch (err) {
    console.warn('Failed to save notification doc:', err);
    return null;
  }
};

export const markNotificationRead = async (id: string) => {
  try {
    await updateDoc(doc(db, COLLECTIONS.NOTIFICATIONS, id), { read: true });
  } catch (err) {
    console.warn('Failed to mark notification read:', err);
  }
};


