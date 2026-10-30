import { CompanyOffer } from '../types';

export const REDZ_OFFICIAL_LINKS = {
  facebook: 'https://www.facebook.com/share/1UXfCR6QMC/?mibextid=wwXIfr',
  linkedin: 'https://www.linkedin.com/company/redz-recruitment1/',
};

export const REDZ_FOLLOW_US_BLOCK = `🔔 Follow us for more job offers:
📘 Facebook: ${REDZ_OFFICIAL_LINKS.facebook}
💼 LinkedIn: ${REDZ_OFFICIAL_LINKS.linkedin}`;

/**
 * Formats a clean, high-converting job offer text for recruiters to copy,
 * publish on social media, or share on WhatsApp, always appending
 * REDZ official Facebook & LinkedIn channels at the very end.
 */
export function formatFullOfferText(
  offer: CompanyOffer,
  options?: {
    recruiterPhone?: string;
    recruiterCode?: string;
    includeApplicationLink?: boolean;
    baseUrl?: string;
  }
): string {
  const reqLines =
    offer.requirements && offer.requirements.length > 0
      ? offer.requirements.map((r) => `  • ${r}`).join('\n')
      : '  • Fluent English speakers (B2 / C1 level)\n  • Graduates & undergrads welcome\n  • Strong communication skills';

  const slotLines =
    offer.interviewSlots && offer.interviewSlots.length > 0
      ? offer.interviewSlots.map((s) => `  • ${s.day} (${s.time}) — [${s.mode || 'In-Person'}]`).join('\n')
      : '  • Flexible interview slots scheduled after language assessment';

  const phone = options?.recruiterPhone?.trim();
  const cleanPhone = (phone || '').replace(/[^0-9]/g, '');
  let waNumber = cleanPhone;
  if (waNumber.startsWith('01')) {
    waNumber = '2' + waNumber;
  }

  let contactSection = '';
  if (phone || waNumber) {
    contactSection = `
══════════════════════════════════
📞 TO APPLY OR FOR DIRECT INQUIRIES:
📱 Mobile: ${phone || 'Available upon request'}
💬 WhatsApp: https://wa.me/${waNumber || '201012345678'}
══════════════════════════════════`;
  }

  let applyLinkSection = '';
  if (options?.includeApplicationLink && options?.baseUrl && options?.recruiterCode) {
    const applyUrl = `${options.baseUrl}/?view=apply&ref=${encodeURIComponent(options.recruiterCode)}&offer=${encodeURIComponent(offer.id)}`;
    applyLinkSection = `
🔗 Direct Application Form:
${applyUrl}
`;
  }

  return `📢 WE ARE HIRING! 🚀
Career Opportunity with REDZ Recruitment Agency

🏢 Company: ${offer.companyName}
💼 Position: ${offer.title}
📍 Location: ${offer.location || 'Cairo / Giza'} (${offer.workType || 'On-site'})
💰 Salary Package: ${offer.salaryPackage || 'Competitive salary package + bonus'}
⏰ Working Hours: ${offer.workingHours || 'Rotational shifts | 5 working days & 2 days off'}

📌 Requirements & Qualifications:
${reqLines}
${offer.notes ? `\n💡 Additional Details:\n  • ${offer.notes}\n` : ''}
🗓️ Scheduled Interview Slots:
${slotLines}
${contactSection}${applyLinkSection}

Best of luck to all candidates! ✨
REDZ Recruitment Agency

${REDZ_FOLLOW_US_BLOCK}`;
}
