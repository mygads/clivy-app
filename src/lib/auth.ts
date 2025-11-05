// Fungsi untuk normalisasi nomor telepon - International format with country codes
export function normalizePhoneNumber(phone: string): string {
  if (!phone) return '';
  
  // Remove spaces, dashes, parentheses but keep +
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
  
  // Handle different input formats
  if (cleanPhone.startsWith('+62')) {
    // Indonesian international format: +628123456789 -> 628123456789
    return cleanPhone.substring(1);
  } else if (cleanPhone.startsWith('+')) {
    // Other international format: +15551234567 -> 15551234567
    return cleanPhone.substring(1);
  } else if (cleanPhone.startsWith('08')) {
    // Indonesian local format: 08123456789 -> 628123456789
    // This is the main fix - ensure 08xxx becomes 628xxx automatically
    return '62' + cleanPhone.substring(1);
  } else if (cleanPhone.startsWith('0') && cleanPhone.length >= 10) {
    // Other local format starting with 0: assume Indonesian for now
    return '62' + cleanPhone.substring(1);
  } else if (cleanPhone.startsWith('62') && cleanPhone.length >= 11) {
    // Already in Indonesian international format without +: 628123456789
    return cleanPhone;
  } else if (cleanPhone.match(/^8[0-9]{8,12}$/)) {
    // Indonesian mobile without country code: 8123456789 -> 628123456789
    return '62' + cleanPhone;
  } else if (cleanPhone.match(/^[1-9]\d{7,14}$/)) {
    // Numbers without + or 0, likely already includes country code
    // Examples: 15551234567 (US), 441234567890 (UK), etc.
    return cleanPhone;
  }
  
  // Fallback: if all else fails, assume Indonesian mobile number
  const digitsOnly = cleanPhone.replace(/\D/g, '');
  if (digitsOnly.length >= 8) {
    // If it starts with 8 and looks like Indonesian mobile, add 62
    if (digitsOnly.startsWith('8')) {
      return '62' + digitsOnly;
    }
    // Otherwise return as is (might be international number)
    return digitsOnly;
  }
  
  return digitsOnly;
}

// Fungsi khusus untuk format WhatsApp dengan + prefix
export function normalizePhoneForWhatsApp(phone: string): string {
  if (!phone) return '';
  
  const normalized = normalizePhoneNumber(phone);
  
  // Ensure + prefix for WhatsApp format
  return normalized.startsWith('+') ? normalized : '+' + normalized;
}
