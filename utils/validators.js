/**
 * validators.js - Validasi input untuk LinkVault
 */

/**
 * Cek apakah string adalah URL valid.
 * Mendukung http, https, ftp, dan domain tanpa scheme.
 */
export function isValidUrl(url) {
  if (typeof url !== 'string') return false;

  const trimmed = url.trim();
  if (!trimmed) return false;

  // Tambahkan https:// jika tidak ada scheme
  const urlToTest = /^[\w][\w+.-]*:\/\//.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;

  try {
    const parsed = new URL(urlToTest);
    // Pastikan ada hostname yang valid (minimal 1 dot atau localhost)
    return /^[\w][\w.-]*\.\w{2,}|localhost$/.test(parsed.hostname);
  } catch {
    return false;
  }
}

/**
 * Cek apakah value tidak kosong (string non-empty setelah trim, atau non-null/undefined).
 */
export function isRequired(value) {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  return true;
}

/**
 * Validasi form bookmark secara lengkap.
 * @param {Object} data - { title, url }
 * @returns {{ valid: boolean, errors: { title?: string, url?: string } }}
 */
export function validateBookmarkForm(data) {
  const errors = {};

  if (!isRequired(data?.title)) {
    errors.title = 'Judul wajib diisi';
  }

  if (!isRequired(data?.url)) {
    errors.url = 'URL wajib diisi';
  } else if (!isValidUrl(data.url)) {
    errors.url = 'Format URL tidak valid';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}
