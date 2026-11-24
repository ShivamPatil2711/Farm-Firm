// In-memory cache to prevent redundant translations
const translationCache = new Map();

/**
 * Translates English text into Hindi using the free Google Translate API.
 * Returns the translated Hindi string, or original string on failure.
 */
export async function translateToHindi(text) {
  if (!text || typeof text !== 'string') return text || '';
  const trimmed = text.trim();
  if (!trimmed) return '';

  if (translationCache.has(trimmed)) {
    return translationCache.get(trimmed);
  }

  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=hi&dt=t&q=${encodeURIComponent(trimmed)}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Translation failed');
    const data = await response.json();

    if (Array.isArray(data) && Array.isArray(data[0])) {
      const translated = data[0].map((item) => item[0]).join('');
      if (translated) {
        translationCache.set(trimmed, translated);
        return translated;
      }
    }
    return trimmed;
  } catch (error) {
    console.warn('Client translation failed, falling back to original:', error);
    return trimmed;
  }
}

/**
 * Translates an array of strings to Hindi in parallel.
 */
export async function translateListToHindi(list) {
  if (!Array.isArray(list) || list.length === 0) return [];
  return Promise.all(list.map((item) => translateToHindi(item)));
}
