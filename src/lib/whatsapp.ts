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

export const getCanonicalCompanyKeyForWhatsApp = (companyName: string = '', title: string = ''): string => {
  const combined = `${companyName} ${title}`.toLowerCase();
  if (combined.includes('teleperformance english') || (combined.includes('teleperformance') && combined.includes('english'))) {
    return 'tp_english';
  }
  if (combined.includes('teleperformance french') || (combined.includes('teleperformance') && combined.includes('french'))) {
    return 'tp_french';
  }
  if (combined.includes('ttec')) {
    return 'ttec';
  }
  if (combined.includes('eclerx')) {
    return 'eclerx';
  }
  if (combined.includes('total trip') || combined.includes('totaltrip')) {
    return 'total_trip';
  }
  if (combined.includes('lpm')) {
    return 'lpm';
  }
  if (combined.includes('creative basket') || combined.includes('creativebasket')) {
    return 'creative_basket';
  }
  return 'default';
};

export const getCompanyConfirmationMessage = (candidate: CandidateApplication): string => {
  const companyKey = getCanonicalCompanyKeyForWhatsApp(candidate.companyName, candidate.offerTitle);
  const dayStr = candidate.scheduledDate 
    ? new Date(candidate.scheduledDate).toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' }) 
    : (candidate.interviewSlotDetails || 'الموعد المحدد');

  switch (companyKey) {
    case 'tp_english':
      return `Hello ${candidate.fullName},

This is Ahmed from Mosla Pioneers. I hope you are doing well. I am writing to confirm your interview for the *Teleperformance English Customer Service account 🇬🇧 position at Teleperformance*

scheduled on: *${dayStr}*
from *11 am to 3 pm*

As a quick reminder, the interview will be held at
📍 Cairo - Plaza
📍 https://g.co/kgs/yWVdUpX
- Don't forget to tell them that you are recruited by MOSLA Pioneers and write on the application form

*Reply with confirmed 👍 if you will attend on time or want me to reschedule*

If you need any further information from me beforehand, please do not hesitate to let me know.

Thank you once again for considering this opportunity.

Don't forget to *Follow Us* on:

Facebook: https://www.facebook.com/share/1UXfCR6QMC/?mibextid=wwXIfr
LinkedIn: https://www.linkedin.com/company/redz-recruitment1/`;

    case 'tp_french':
      return `Hello ${candidate.fullName},

I hope you are doing well. I am writing to confirm your interview for the *Customer Service position at Teleperformance ( French Account )* 

scheduled on: *${dayStr}*
at *10am to 5pm*

As a quick reminder, the interview will be held at 
📍 Address 
‎*Tp french account*

 Teleperformance Egypt - Cairo - One Kattameya

 https://g.co/kgs/n9F4xZW

- Don’t forget to tell them that you are recruited by MOSLA Pioneers and write on the application form

*Reply with confirmed 👍 if you will attend on time or want me to reschedule*

if you need any further information from me beforehand, please do not hesitate to let me know.

Thank you once again for considering this opportunity .

Don’t forget to *Follow Us* on :

Facebook: https://www.facebook.com/share/1UXfCR6QMC/?mibextid=wwXIfr
LinkedIn: https://www.linkedin.com/company/redz-recruitment1/`;

    case 'ttec':
      return `Hello ${candidate.fullName},

We are confirming your dedicated interview slot in TTEC. We've reserved this time just for you!

📅 Date: *${dayStr}*
⏰ Time: Between 11:00 AM – 3:00 PM (Sharp)
👔 Dress Code: Smart-Casual

📍 Address:
TTEC Office
🔗 Location: Click here 
https://maps.app.goo.gl/HBHLJSy4XxejTmXA8?g_st=iw

⚠️ Please make sure to bring your National ID with you.

✅ Reply with "Confirmed" if you’re attending the interview at the stated time above.

✨ Don’t forget to tell them that you are recruited by MOSLA Pioneers and make sure to write it on the application form.

Plz make sure to attend on time cuz they appreciate commitments and punctuality.
Wish you the best of luck! 🍀. Follow Us on :

Facebook: https://www.facebook.com/share/1UXfCR6QMC/?mibextid=wwXIfr
LinkedIn: https://www.linkedin.com/company/redz-recruitment1/`;

    case 'eclerx':
      return `Hello ${candidate.fullName},

We are confirming your dedicated interview slot in Eclerx. We've reserved this time just for you!

📅 Date: *${dayStr}*
⏰ Time: Between 1:00 PM – 5:00 PM (Sharp)
👔 Dress Code: Smart-Casual

📍 Address:
Eclerx Office
🔗 Location: Click here 
https://share.google/OQ5mIFnPA3ucWGBvL

⚠️ Please make sure to bring your National ID with you.

✅ Reply with "Confirmed" if you’re attending the interview at the stated time above.

✨ Don’t forget to tell them that you are recruited by MOSLA Pioneers and make sure to write it on the application form.

Plz make sure to attend on time cuz they appreciate commitments and punctuality.
Follow Us on :

Facebook: https://www.facebook.com/share/1UXfCR6QMC/?mibextid=wwXIfr
LinkedIn: https://www.linkedin.com/company/redz-recruitment1/`;

    case 'total_trip':
      return `Interview Confirmation
Total Trip

Hello ${candidate.fullName},

We are pleased to confirm your interview as follows:

📅 Day: *${dayStr}*
⏰ Time: 2:00 PM – 3:00 PM

📍 Location:
شقه ٢ عماره ٦ مريع ١١٨٣ مساكن شيراتون
Unit 2, Building 6, Square 1183, Masaken Sheraton – Heliopolis, Cairo, Egypt

📍 Google Maps:
https://maps.google.com/?q=30.094416,31.376213

Upon arrival:

Please mention that you are coming from Career Core (Mosla Pioneers)

⚠️ Important Instructions:

Arabic:
المدخل مدخل خاص من جانب المبنى في الدور الأرضي، وليس المدخل الرئيسي، وليس "ترافكو".
لا تستخدم الانتركم أو تدخل من المدخل الرئيسي للمبنى.
استخدام مدخل خاطئ أو استخدام جهاز الانتركم أو دخول "ترافكو" سيؤدي إلى رفض طلب المرشح تلقائيًا.

English:
The entrance is a private entrance from the SIDE of the building on the ground floor and NOT the main entrance and NOT “Travco”.
Do NOT ring the intercom or enter the main building entrance.
Using the wrong entrance or using the intercom or entering “Travco” will result in automatic rejection of the candidate’s application.

Best regards,`;

    case 'lpm':
      return `Hello ${candidate.fullName},

We are pleased to confirm your interview scheduled, 📅 Day: *${dayStr}* between 7:30 to 9:30 pm, at the following location:

El Motamyz District, Seyahya 6, Sameh Gado St.
Building 112, 3rd floor, Apt 7
https://maps.app.goo.gl/yA2Rra6EbGLGqBMu8?g_st=iw

🔔 Upon arrival:
        •        Clearly state that you are coming from Career Core (Mosla Pioneers).

We look forward to seeing you and wish you the best of luck in your interview.

Best regards,`;

    case 'creative_basket':
      return `Hello ${candidate.fullName},

We are pleased to confirm your interview scheduled,
 📅 Day: *${dayStr}*
 between 2pm to 5pm
at the following location:
٢ حافظ رمضان -عمارات الدلتا- اول مكرم عبيد 
M floor
https://maps.app.goo.gl/GGe1whuWRfwEtSJ59

🔔 Upon arrival:
        •        Clearly state that you are coming from Career Core (Mosla Pioneers).

We look forward to seeing you and wish you the best of luck in your interview.

Best regards,`;

    default:
      return `Hello ${candidate.fullName},

We are pleased to confirm your interview for *${candidate.offerTitle}* at *${candidate.companyName}*.

📅 Date & Time: *${dayStr}* (${candidate.interviewSlotDetails})
📍 Location: Please contact HR for exact directions.

- Don't forget to tell them that you are recruited by MOSLA Pioneers / Career Core and write it on the application form.
- Please bring your National ID.

*Reply with confirmed 👍 if you will attend on time or want me to reschedule*

Best regards,
Mosla Pioneers Team`;
  }
};

export const getAskForFeedbackMessage = (candidate: CandidateApplication): string => {
  return `Hi ${candidate.fullName}, this is HR.

You had an interview with ${candidate.companyName || candidate.offerTitle} today. Did you attend the interview? If yes, could you please share the feedback with me?`;
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
    taskInstruction = `👉 *المطلوب منك:* الاتصال بالكانديدت للتنسيق على معاد الانترفيو المناسب، ثم تعديل الاستاتوس إلى (Upcoming Interview).`;
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
