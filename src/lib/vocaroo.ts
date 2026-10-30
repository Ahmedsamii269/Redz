/**
 * Utilities to parse and render Vocaroo voice notes cleanly
 */

export interface VocarooInfo {
  isValid: boolean;
  recordingId: string | null;
  embedUrl: string | null;
  mp3Url: string | null;
  originalUrl: string;
}

export const parseVocarooUrl = (rawUrl: string): VocarooInfo => {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return { isValid: false, recordingId: null, embedUrl: null, mp3Url: null, originalUrl: '' };
  }

  const clean = rawUrl.trim();
  // Match vocaroo.com/<id> or voca.ro/<id> or vocaroo.com/i/<id>
  const regex = /(?:vocaroo\.com\/(?:i\/)?|voca\.ro\/)([a-zA-Z0-9_-]+)/i;
  const match = clean.match(regex);

  if (match && match[1]) {
    const recordingId = match[1];
    return {
      isValid: true,
      recordingId,
      embedUrl: `https://vocaroo.com/embed/${recordingId}?autoplay=0`,
      mp3Url: `https://media1.vocaroo.com/mp3/${recordingId}`,
      originalUrl: clean.startsWith('http') ? clean : `https://${clean}`,
    };
  }

  // Fallback if user just entered the ID
  if (/^[a-zA-Z0-9_-]{8,15}$/.test(clean)) {
    return {
      isValid: true,
      recordingId: clean,
      embedUrl: `https://vocaroo.com/embed/${clean}?autoplay=0`,
      mp3Url: `https://media1.vocaroo.com/mp3/${clean}`,
      originalUrl: `https://vocaroo.com/${clean}`,
    };
  }

  return {
    isValid: false,
    recordingId: null,
    embedUrl: null,
    mp3Url: null,
    originalUrl: clean,
  };
};
