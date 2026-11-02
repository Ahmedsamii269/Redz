import { CandidateApplication, User } from '../types';

export interface RecruiterBadge {
  id: string;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  icon: string; // Emoji or Lucide icon name
  bgClass: string;
  textClass: string;
  borderClass: string;
}

export const BADGES_CATALOG: Record<string, RecruiterBadge> = {
  CHAMPION: {
    id: 'CHAMPION',
    titleAr: 'بطل الشهر 🏆',
    titleEn: 'Monthly Champion 🏆',
    descriptionAr: 'المركز الأول في عدد المقبولين هذا الشهر',
    descriptionEn: 'Rank #1 in accepted candidates this month',
    icon: '🏆',
    bgClass: 'bg-amber-50',
    textClass: 'text-amber-800',
    borderClass: 'border-amber-300',
  },
  FAST_CONVERTER: {
    id: 'FAST_CONVERTER',
    titleAr: 'محول سريع ⚡',
    titleEn: 'Fast Converter ⚡',
    descriptionAr: 'نسبة قبول تحويل تتجاوز 40%',
    descriptionEn: 'Conversion rate exceeding 40%',
    icon: '⚡',
    bgClass: 'bg-blue-50',
    textClass: 'text-blue-800',
    borderClass: 'border-blue-300',
  },
  VOICE_MASTER: {
    id: 'VOICE_MASTER',
    titleAr: 'خبير الفويس نوت 🎧',
    titleEn: 'Voice Specialist 🎧',
    descriptionAr: 'نجح في تسليم 5 فويس نوتس مقبولة على الأقل',
    descriptionEn: 'Delivered 5+ accepted voice notes',
    icon: '🎧',
    bgClass: 'bg-emerald-50',
    textClass: 'text-emerald-800',
    borderClass: 'border-emerald-300',
  },
  TARGET_CRUSHER: {
    id: 'TARGET_CRUSHER',
    titleAr: 'قاهر التارجت 🎯',
    titleEn: 'Target Crusher 🎯',
    descriptionAr: 'حقق أكثر من 10 متقدمين مقبولين',
    descriptionEn: 'Achieved 10+ accepted candidates',
    icon: '🎯',
    bgClass: 'bg-purple-50',
    textClass: 'text-purple-800',
    borderClass: 'border-purple-300',
  },
  STREAK_MASTER: {
    id: 'STREAK_MASTER',
    titleAr: 'نشاط مستمر 🔥',
    titleEn: 'Streak Master 🔥',
    descriptionAr: 'قدم مرشحين جدد بانتظام في آخر 7 أيام',
    descriptionEn: 'Consistently submitted candidates in the last 7 days',
    icon: '🔥',
    bgClass: 'bg-orange-50',
    textClass: 'text-orange-800',
    borderClass: 'border-orange-300',
  },
  RISING_STAR: {
    id: 'RISING_STAR',
    titleAr: 'نجم صاعد 🌟',
    titleEn: 'Rising Star 🌟',
    descriptionAr: 'أداء متميز واستجابة سريعة للتقديمات',
    descriptionEn: 'Outstanding performance and fast candidate flow',
    icon: '🌟',
    bgClass: 'bg-rose-50',
    textClass: 'text-rose-800',
    borderClass: 'border-rose-300',
  },
};

export const calculateRecruiterBadges = (
  recruiterId: string,
  recruiterUsername: string,
  allCandidates: CandidateApplication[],
  rank: number
): RecruiterBadge[] => {
  const recruiterApps = allCandidates.filter(
    (c) =>
      c.recruiterId === recruiterId ||
      c.recruiterCode?.toLowerCase() === recruiterUsername.toLowerCase() ||
      c.recruiterId === recruiterUsername
  );

  const totalApps = recruiterApps.length;
  const acceptedApps = recruiterApps.filter(
    (c) => (c.status || '').trim().toLowerCase() === 'voice note accepted'
  ).length;

  const conversionRate = totalApps > 0 ? (acceptedApps / totalApps) * 100 : 0;

  const earnedBadges: RecruiterBadge[] = [];

  // 1. Champion (#1 Rank with at least 1 accepted)
  if (rank === 1 && acceptedApps > 0) {
    earnedBadges.push(BADGES_CATALOG.CHAMPION);
  }

  // 2. Target Crusher (10+ accepted)
  if (acceptedApps >= 10) {
    earnedBadges.push(BADGES_CATALOG.TARGET_CRUSHER);
  } else if (acceptedApps >= 5) {
    earnedBadges.push(BADGES_CATALOG.VOICE_MASTER);
  }

  // 3. Fast Converter (Conversion rate >= 35% with min 4 total apps)
  if (conversionRate >= 35 && totalApps >= 4) {
    earnedBadges.push(BADGES_CATALOG.FAST_CONVERTER);
  }

  // 4. Streak Master (submitted candidate in past 3 days)
  const recentApps = recruiterApps.filter((c) => {
    const diffDays = (Date.now() - new Date(c.createdAt || 0).getTime()) / (1000 * 3600 * 24);
    return diffDays <= 3;
  });
  if (recentApps.length >= 2) {
    earnedBadges.push(BADGES_CATALOG.STREAK_MASTER);
  }

  // 5. Rising Star
  if (totalApps >= 3 && earnedBadges.length === 0) {
    earnedBadges.push(BADGES_CATALOG.RISING_STAR);
  }

  return earnedBadges;
};
