export function applyFocusReading(text: string): string {
  if (!text || typeof text !== 'string') return text;

  // Regex to match:
  // Group 1: URLs or Emails
  // Group 2: Words (including Spanish characters)
  const regex = /(https?:\/\/\S+|www\.\S+|[^\s@]+@[^\s@]+\.[^\s@]+)|([a-zA-ZáéíóúÁÉÍÓÚñÑüÜ]+)/g;

  return text.replace(regex, (match, urlOrEmail, word) => {
    if (urlOrEmail) {
      return urlOrEmail; // Keep URLs and Emails intact
    }
    if (word) {
      const len = word.length;
      if (len <= 2) return word; // Don't change 1 or 2 letter words

      let upperCount = 0;
      if (len === 3) upperCount = 1;
      else if (len >= 4 && len <= 5) upperCount = 2;
      else if (len >= 6 && len <= 8) upperCount = 3;
      else upperCount = 4; // len > 8

      return word.substring(0, upperCount).toUpperCase() + word.substring(upperCount);
    }
    return match;
  });
}
