export interface CommissionGroup {
  id: string;
  category: 'CS English' | 'CS Languages';
  categoryLabel: string;
  companiesRaw: string;
  companiesList: string[];
  terms: string;
  termsDays: number;
  recruiterCommission: number;
  leaderCommission: number;
  unitCommission: number;
  notes?: string;
}

export interface CompanyCommissionDetail {
  id: string;
  companyName: string;
  accountType: string;
  category: 'CS English' | 'CS Languages';
  terms: string;
  termsDays: number;
  recruiterCommission: number;
  leaderCommission: number;
  unitCommission: number;
  matchingOfferKeywords: string[];
}

// Master groups directly from REDZ Agency Commission Chart image
export const COMMISSION_GROUPS: CommissionGroup[] = [
  // --- CS English ---
  {
    id: 'comm-eng-1',
    category: 'CS English',
    categoryLabel: 'CS English Accounts',
    companiesRaw: 'CNX // Alorica // TP // ttec',
    companiesList: ['Concentrix (CNX)', 'Alorica', 'Teleperformance (TP)', 'TTEC'],
    terms: '30 days',
    termsDays: 30,
    recruiterCommission: 1300,
    leaderCommission: 1700,
    unitCommission: 2000,
    notes: 'Major global BPO English customer service accounts'
  },
  {
    id: 'comm-eng-2',
    category: 'CS English',
    categoryLabel: 'CS English Accounts',
    companiesRaw: 'sutherland // eclerx',
    companiesList: ['Sutherland', 'eClerx'],
    terms: '45 days',
    termsDays: 45,
    recruiterCommission: 1300,
    leaderCommission: 1700,
    unitCommission: 2000,
    notes: 'Payment eligibility after 45 days retention'
  },
  {
    id: 'comm-eng-3',
    category: 'CS English',
    categoryLabel: 'CS English Accounts',
    companiesRaw: 'total trip // lpm // global // LTS // ABS // Creative Basket',
    companiesList: ['Total Trip (TTP)', 'LPM', 'Global Results', 'LTS', 'Amend Business Solutions (ABS)', 'Creative Basket'],
    terms: '30 days',
    termsDays: 30,
    recruiterCommission: 1000,
    leaderCommission: 1500,
    unitCommission: 1800,
    notes: 'Customer support, travel reservations, and sales accounts'
  },
  {
    id: 'comm-eng-4',
    category: 'CS English',
    categoryLabel: 'CS English Accounts',
    companiesRaw: 'Dial expert',
    companiesList: ['Dial Expert'],
    terms: '30 days',
    termsDays: 30,
    recruiterCommission: 800,
    leaderCommission: 1200,
    unitCommission: 1500,
    notes: 'US Financial advisory and closing account'
  },

  // --- CS Languages ---
  {
    id: 'comm-lang-1',
    category: 'CS Languages',
    categoryLabel: 'CS Languages (Multilingual)',
    companiesRaw: 'CNX other languages // Alorica langs // TP language',
    companiesList: ['Concentrix (CNX) Languages', 'Alorica Languages', 'Teleperformance (TP) Languages'],
    terms: '30 days',
    termsDays: 30,
    recruiterCommission: 1500,
    leaderCommission: 2000,
    unitCommission: 2500,
    notes: 'Multilingual CS (French, German, Italian, Spanish)'
  },
  {
    id: 'comm-lang-2',
    category: 'CS Languages',
    categoryLabel: 'CS Languages (Multilingual)',
    companiesRaw: 'TP language // VXI Spanish ( Monolingual ) // INtouchCX other languages //',
    companiesList: ['Teleperformance (TP) Languages', 'VXI Spanish (Monolingual)', 'INtouchCX Other Languages'],
    terms: '30 days',
    termsDays: 30,
    recruiterCommission: 1500,
    leaderCommission: 2000,
    unitCommission: 2500,
    notes: 'Spanish monolingual, IntouchCX, and Teleperformance languages'
  },
  {
    id: 'comm-lang-3',
    category: 'CS Languages',
    categoryLabel: 'CS Languages (Multilingual)',
    companiesRaw: 'sutherland language // TTEC languages',
    companiesList: ['Sutherland Languages', 'TTEC Languages (German, French, Italian, Dutch, Spanish, Portuguese)'],
    terms: '45 days',
    termsDays: 45,
    recruiterCommission: 1500,
    leaderCommission: 2000,
    unitCommission: 2500,
    notes: 'Payment eligibility after 45 days for multilingual roles'
  },
  {
    id: 'comm-lang-4',
    category: 'CS Languages',
    categoryLabel: 'CS Languages (Multilingual)',
    companiesRaw: 'VXI Spanish \\ Alorica spanish ( Bilingual )',
    companiesList: ['VXI Spanish (Bilingual)', 'Alorica Spanish (Bilingual)'],
    terms: '30 days',
    termsDays: 30,
    recruiterCommission: 1500,
    leaderCommission: 2000,
    unitCommission: 2500,
    notes: 'Spanish & English bilingual support accounts'
  }
];

// Granular individual company lookup table
export const INDIVIDUAL_COMPANIES_COMMISSION: CompanyCommissionDetail[] = [
  // CS English Tier 1
  {
    id: 'comp-cnx-eng',
    companyName: 'Concentrix (CNX)',
    accountType: 'Customer Service – English (B2–C1)',
    category: 'CS English',
    terms: '30 days',
    termsDays: 30,
    recruiterCommission: 1300,
    leaderCommission: 1700,
    unitCommission: 2000,
    matchingOfferKeywords: ['cnx', 'concentrix']
  },
  {
    id: 'comp-alorica-eng',
    companyName: 'Alorica',
    accountType: 'English US Airline & Travel CS',
    category: 'CS English',
    terms: '30 days',
    termsDays: 30,
    recruiterCommission: 1300,
    leaderCommission: 1700,
    unitCommission: 2000,
    matchingOfferKeywords: ['alorica']
  },
  {
    id: 'comp-tp-eng',
    companyName: 'Teleperformance (TP)',
    accountType: 'Customer Service – English (Banking / CS)',
    category: 'CS English',
    terms: '30 days',
    termsDays: 30,
    recruiterCommission: 1300,
    leaderCommission: 1700,
    unitCommission: 2000,
    matchingOfferKeywords: ['tp', 'teleperformance']
  },
  {
    id: 'comp-ttec-eng',
    companyName: 'TTEC',
    accountType: 'English Customer Service & Sales (C1)',
    category: 'CS English',
    terms: '30 days',
    termsDays: 30,
    recruiterCommission: 1300,
    leaderCommission: 1700,
    unitCommission: 2000,
    matchingOfferKeywords: ['ttec', 'ttec - english']
  },

  // CS English Tier 2 (45 days)
  {
    id: 'comp-sutherland-eng',
    companyName: 'Sutherland',
    accountType: 'English AT&T / DTV Care & Sales',
    category: 'CS English',
    terms: '45 days',
    termsDays: 45,
    recruiterCommission: 1300,
    leaderCommission: 1700,
    unitCommission: 2000,
    matchingOfferKeywords: ['sutherland']
  },
  {
    id: 'comp-eclerx-eng',
    companyName: 'eClerx',
    accountType: 'Customer Support Specialist – English',
    category: 'CS English',
    terms: '45 days',
    termsDays: 45,
    recruiterCommission: 1300,
    leaderCommission: 1700,
    unitCommission: 2000,
    matchingOfferKeywords: ['eclerx']
  },

  // CS English Tier 3 (1000/1500/1800)
  {
    id: 'comp-ttp-eng',
    companyName: 'Total Trip (TTP)',
    accountType: 'English Sales Agent (Fixed Shift)',
    category: 'CS English',
    terms: '30 days',
    termsDays: 30,
    recruiterCommission: 1000,
    leaderCommission: 1500,
    unitCommission: 1800,
    matchingOfferKeywords: ['total trip', 'ttp']
  },
  {
    id: 'comp-lpm-eng',
    companyName: 'LPM',
    accountType: 'English Customer Support (October)',
    category: 'CS English',
    terms: '30 days',
    termsDays: 30,
    recruiterCommission: 1000,
    leaderCommission: 1500,
    unitCommission: 1800,
    matchingOfferKeywords: ['lpm']
  },
  {
    id: 'comp-global-eng',
    companyName: 'Global Results',
    accountType: 'English Telesales Agent',
    category: 'CS English',
    terms: '30 days',
    termsDays: 30,
    recruiterCommission: 1000,
    leaderCommission: 1500,
    unitCommission: 1800,
    matchingOfferKeywords: ['global', 'global results']
  },
  {
    id: 'comp-lts-eng',
    companyName: 'LTS',
    accountType: 'Hotel Surveys & Inbound Vacation Sales',
    category: 'CS English',
    terms: '30 days',
    termsDays: 30,
    recruiterCommission: 1000,
    leaderCommission: 1500,
    unitCommission: 1800,
    matchingOfferKeywords: ['lts']
  },
  {
    id: 'comp-abs-eng',
    companyName: 'Amend Business Solutions (ABS)',
    accountType: 'Customer Service & Tele-sales',
    category: 'CS English',
    terms: '30 days',
    termsDays: 30,
    recruiterCommission: 1000,
    leaderCommission: 1500,
    unitCommission: 1800,
    matchingOfferKeywords: ['abs', 'amend']
  },
  {
    id: 'comp-creative-eng',
    companyName: 'Creative Basket',
    accountType: 'English Customer Service',
    category: 'CS English',
    terms: '30 days',
    termsDays: 30,
    recruiterCommission: 1000,
    leaderCommission: 1500,
    unitCommission: 1800,
    matchingOfferKeywords: ['creative basket', 'creativebasket']
  },

  // CS English Tier 4 (Dial Expert)
  {
    id: 'comp-dialexpert-eng',
    companyName: 'Dial Expert',
    accountType: 'US Financial Advisor (Closer)',
    category: 'CS English',
    terms: '30 days',
    termsDays: 30,
    recruiterCommission: 800,
    leaderCommission: 1200,
    unitCommission: 1500,
    matchingOfferKeywords: ['dial expert']
  },

  // CS Languages Tier 1
  {
    id: 'comp-cnx-lang',
    companyName: 'Concentrix (CNX) Languages',
    accountType: 'German / French / Italian / Spanish CS',
    category: 'CS Languages',
    terms: '30 days',
    termsDays: 30,
    recruiterCommission: 1500,
    leaderCommission: 2000,
    unitCommission: 2500,
    matchingOfferKeywords: ['cnx', 'concentrix']
  },
  {
    id: 'comp-alorica-lang',
    companyName: 'Alorica Languages',
    accountType: 'French / Spanish / German CS',
    category: 'CS Languages',
    terms: '30 days',
    termsDays: 30,
    recruiterCommission: 1500,
    leaderCommission: 2000,
    unitCommission: 2500,
    matchingOfferKeywords: ['alorica']
  },
  {
    id: 'comp-tp-lang',
    companyName: 'Teleperformance (TP) Languages',
    accountType: 'French Travel / Technical Support / Spanish',
    category: 'CS Languages',
    terms: '30 days',
    termsDays: 30,
    recruiterCommission: 1500,
    leaderCommission: 2000,
    unitCommission: 2500,
    matchingOfferKeywords: ['teleperformance', 'tp']
  },

  // CS Languages Tier 2
  {
    id: 'comp-vxi-spanish-mono',
    companyName: 'VXI Spanish (Monolingual)',
    accountType: 'Spanish Monolingual CS',
    category: 'CS Languages',
    terms: '30 days',
    termsDays: 30,
    recruiterCommission: 1500,
    leaderCommission: 2000,
    unitCommission: 2500,
    matchingOfferKeywords: ['vxi']
  },
  {
    id: 'comp-intouchcx-lang',
    companyName: 'INtouchCX Languages',
    accountType: 'French CS (Maadi / Sheikh Zayed)',
    category: 'CS Languages',
    terms: '30 days',
    termsDays: 30,
    recruiterCommission: 1500,
    leaderCommission: 2000,
    unitCommission: 2500,
    matchingOfferKeywords: ['intouchcx', 'intouch']
  },

  // CS Languages Tier 3 (45 days)
  {
    id: 'comp-sutherland-lang',
    companyName: 'Sutherland Languages',
    accountType: 'French Bilingual CS & Technical',
    category: 'CS Languages',
    terms: '45 days',
    termsDays: 45,
    recruiterCommission: 1500,
    leaderCommission: 2000,
    unitCommission: 2500,
    matchingOfferKeywords: ['sutherland']
  },
  {
    id: 'comp-ttec-lang',
    companyName: 'TTEC Languages',
    accountType: 'German / French / Dutch / Spanish / Portuguese / Italian',
    category: 'CS Languages',
    terms: '45 days',
    termsDays: 45,
    recruiterCommission: 1500,
    leaderCommission: 2000,
    unitCommission: 2500,
    matchingOfferKeywords: ['ttec', 'ttec - french', 'ttec - german']
  },

  // CS Languages Tier 4 (Bilingual Spanish)
  {
    id: 'comp-vxi-spanish-bi',
    companyName: 'VXI Spanish (Bilingual)',
    accountType: 'Spanish & English Bilingual Support',
    category: 'CS Languages',
    terms: '30 days',
    termsDays: 30,
    recruiterCommission: 1500,
    leaderCommission: 2000,
    unitCommission: 2500,
    matchingOfferKeywords: ['vxi']
  },
  {
    id: 'comp-alorica-spanish-bi',
    companyName: 'Alorica Spanish (Bilingual)',
    accountType: 'Spanish Bilingual CS Account',
    category: 'CS Languages',
    terms: '30 days',
    termsDays: 30,
    recruiterCommission: 1500,
    leaderCommission: 2000,
    unitCommission: 2500,
    matchingOfferKeywords: ['alorica']
  }
];

// Helper to determine if user can view Team Leader commission
export function canViewLeaderCommission(role?: string): boolean {
  if (!role) return false;
  return role === 'team_leader' || role === 'unit_manager' || role === 'admin' || role === 'account_manager';
}

// Helper to determine if user can view Unit Manager commission
export function canViewUnitCommission(role?: string): boolean {
  if (!role) return false;
  return role === 'unit_manager' || role === 'admin' || role === 'account_manager';
}

// Get the user's primary commission value for a given group or company
export function getUserCommissionAmount(
  role: string | undefined,
  entry: { recruiterCommission: number; leaderCommission: number; unitCommission: number }
): { amount: number; label: string; roleTag: string } {
  if (!role || role === 'recruiter') {
    return {
      amount: entry.recruiterCommission,
      label: 'Recruiter Commission',
      roleTag: 'recruiter'
    };
  }
  if (role === 'team_leader') {
    return {
      amount: entry.leaderCommission,
      label: 'Team Leader Commission',
      roleTag: 'leader'
    };
  }
  if (role === 'unit_manager') {
    return {
      amount: entry.unitCommission,
      label: 'Unit Manager Commission',
      roleTag: 'unit'
    };
  }
  // Admin & Account Manager
  return {
    amount: entry.unitCommission,
    label: 'Unit Tier Commission',
    roleTag: 'admin'
  };
}
