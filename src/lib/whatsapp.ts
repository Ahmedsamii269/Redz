import { CandidateApplication } from '../types';

export const getStoredWhatsAppConfig = () => {
  if (typeof window === 'undefined') {
    return {
      voiceAcceptedPhone: '01030571189',
      voiceAcceptedEmployeeName: 'منسق مواعيد الانترفيو',
      upcomingInterviewPhone: '01003704465',
      upcomingInterviewEmployeeName: 'مسؤول الفيدباك والمتابعة',
    };
  }
  return {
    voiceAcceptedPhone: localStorage.getItem('rf_voice_accepted_phone') || '01030571189',
    voiceAcceptedEmployeeName: localStorage.getItem('rf_voice_accepted_emp_name') || 'منسق مواعيد الانترفيو',
    upcomingInterviewPhone: localStorage.getItem('rf_upcoming_interview_phone') || '01003704465',
    upcomingInterviewEmployeeName: localStorage.getItem('rf_upcoming_interview_emp_name') || 'مسؤول الفيدباك والمتابعة',
  };
};

export const saveStoredWhatsAppConfig = (
  voicePhone: string,
  voiceEmpName: string,
  interviewPhone: string,
  interviewEmpName: string
) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('rf_voice_accepted_phone', voicePhone);
    localStorage.setItem('rf_voice_accepted_emp_name', voiceEmpName);
    localStorage.setItem('rf_upcoming_interview_phone', interviewPhone);
    localStorage.setItem('rf_upcoming_interview_emp_name', interviewEmpName);
  }
};

export const formatWhatsAppCandidateMessage = (
  candidate: CandidateApplication,
  newStatus: string,
  note?: string
) => {
  const isVoiceAccepted = newStatus === 'voice note accepted';
  const isUpcomingInterview = newStatus === 'Upcoming Interview';
  const config = getStoredWhatsAppConfig();

  let header = '';
  let taskInstruction = '';

  if (isVoiceAccepted) {
    const empName = config.voiceAcceptedEmployeeName || 'منسق المواعيد';
    header = `🎧 *إشعار إلى ${empName}: قبول فويس نوت جاهز لحجز الانترفيو*`;
    taskInstruction = `👉 *المطلوب منك:* الاتصال بالكانديدت للتتفيق على معاد الانترفيو المناسب، ثم تعديل الاستاتوس إلى (Upcoming Interview).`;
  } else if (isUpcomingInterview) {
    const empName = config.upcomingInterviewEmployeeName || 'مسؤول الفيدباك';
    header = `📅 *إشعار إلى ${empName}: انترفيو محدد ومجهز للمتابعة*`;
    taskInstruction = `👉 *المطلوب منك:* متابعة حضور الكانديدت في معاد الانترفيو وأخذ الفيدباك لمعرفة هل اتقبل أم لا وتحديث الاستاتوس.`;
  } else {
    header = `📋 *تحديث حالة كانديدت - REDZ Agency*`;
    taskInstruction = `👉 *المطلوب:* المتابعة واتخاذ الإجراء اللازم.`;
  }

  const gradText = candidate.graduationStatus === 'graduated' ? 'خريج' : 'طالب / مؤهل متوسط';

  const lines = [
    header,
    `-----------------------------------`,
    `👤 *اسم الكانديدت:* ${candidate.fullName}`,
    `📱 *رقم الموبايل:* ${candidate.phone}`,
    `🆔 *كود المتقدم:* ${candidate.referenceCode}`,
    `🏢 *الشركة:* ${candidate.companyName}`,
    `💼 *الوظيفة والعرض:* ${candidate.offerTitle}`,
    `⏰ *الموعد المحجوز حالياً:* ${candidate.interviewSlotDetails}`,
    isUpcomingInterview && candidate.scheduledDate ? `📅 *موعد الانترفيو المحدد:* ${new Date(candidate.scheduledDate).toLocaleString('ar-EG', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })}` : '',
    `🎓 *المؤهل:* ${gradText}`,
    `📍 *العنوان ومحل الإقامة:* ${candidate.residence}`,
    candidate.experienceLevel ? `⭐ *الخبرات:* ${candidate.experienceLevel} ${candidate.experienceDetails ? `(${candidate.experienceDetails})` : ''}` : '',
    candidate.vocarooUrl ? `🎧 *رابط التسجيل الصوتي (English):* ${candidate.vocarooUrl}` : '',
    candidate.vocarooUrl2 ? `🎧 *رابط التسجيل الصوتي (لغة ثانية):* ${candidate.vocarooUrl2}` : '',
    `👤 *الريكروتر المسؤول:* ${candidate.recruiterName} (@${candidate.recruiterCode})`,
    note ? `📝 *ملاحظات الإدارة:* ${note}` : candidate.feedbackNotes ? `📝 *ملاحظات الإدارة:* ${candidate.feedbackNotes}` : '',
    `-----------------------------------`,
    taskInstruction,
  ].filter(Boolean);

  return lines.join('\n');
};

export const openWhatsAppDirect = (phone: string, message: string) => {
  const cleanPhone = phone.replace(/\D/g, '');
  const formattedPhone = cleanPhone.startsWith('2') ? cleanPhone : `2${cleanPhone}`;
  const url = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank');
};
