/**
 * formatters.js - Formatting utilities untuk LinkVault
 */

/**
 * Format tanggal ke locale Indonesia.
 * Contoh: "7 Jun 2026", "1 Jan 2026"
 */
export function formatDate(dateString) {
  if (!dateString) return '-';

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return '-';

  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Format tanggal sebagai waktu relatif dalam Bahasa Indonesia.
 * Contoh: "baru saja", "5 menit yang lalu", "2 jam yang lalu", "3 hari yang lalu"
 */
export function relativeTime(dateString) {
  if (!dateString) return '-';

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return '-';

  const now = Date.now();
  const diffMs = now - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);

  if (diffSec < 60) return 'baru saja';

  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} menit yang lalu`;

  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour} jam yang lalu`;

  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 30) return `${diffDay} hari yang lalu`;

  const diffMonth = Math.floor(diffDay / 30);
  if (diffMonth < 12) return `${diffMonth} bulan yang lalu`;

  const diffYear = Math.floor(diffMonth / 12);
  return `${diffYear} tahun yang lalu`;
}

/**
 * Potong teks dengan ellipsis jika melebihi maxLength.
 */
export function truncateText(text, maxLength = 50) {
  if (!text || typeof text !== 'string') return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + '…';
}

/**
 * Pastikan URL memiliki scheme (https://).
 * "google.com" → "https://google.com"
 * "http://google.com" → "http://google.com" (tidak diubah)
 */
export function ensureScheme(url) {
  if (!url || typeof url !== 'string') return url;
  const trimmed = url.trim();
  if (!trimmed) return trimmed;
  if (/^[\w][\w+.-]*:\/\//.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

/**
 * Ambil huruf pertama dari teks, uppercase.
 * Untuk emoji atau multi-codepoint, fallback ke karakter pertama.
 */
export function getInitial(text) {
  if (!text || typeof text !== 'string') return '?';
  const trimmed = text.trim();
  if (!trimmed) return '?';
  return trimmed.charAt(0).toUpperCase();
}
