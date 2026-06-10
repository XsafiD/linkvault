/**
 * helpers.js - Helper utilities untuk LinkVault
 */

/**
 * Generate UUID v4 string.
 */
export function generateId() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Return ISO 8601 timestamp string (UTC).
 */
export function getTimestamp() {
  return new Date().toISOString();
}
