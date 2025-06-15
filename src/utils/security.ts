
// Simple encryption utilities for localStorage
const ENCRYPTION_KEY = 'kajian-hadir-key';

export function encryptData(data: any): string {
  try {
    const jsonString = JSON.stringify(data);
    // Simple base64 encoding (for basic obfuscation, not real security)
    return btoa(encodeURIComponent(jsonString));
  } catch (error) {
    console.error('Encryption error:', error);
    return '';
  }
}

export function decryptData(encryptedData: string): any {
  try {
    const decodedData = decodeURIComponent(atob(encryptedData));
    return JSON.parse(decodedData);
  } catch (error) {
    console.error('Decryption error:', error);
    return null;
  }
}

// Secure localStorage wrapper
export const secureStorage = {
  setItem: (key: string, value: any) => {
    try {
      const encrypted = encryptData(value);
      localStorage.setItem(key, encrypted);
    } catch (error) {
      console.error('SecureStorage setItem error:', error);
    }
  },
  
  getItem: (key: string) => {
    try {
      const encrypted = localStorage.getItem(key);
      if (!encrypted) return null;
      return decryptData(encrypted);
    } catch (error) {
      console.error('SecureStorage getItem error:', error);
      return null;
    }
  },
  
  removeItem: (key: string) => {
    localStorage.removeItem(key);
  }
};

// Input sanitization
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>'"]/g, '') // Remove potential XSS characters
    .substring(0, 1000); // Limit length
}

// Email validation
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Phone validation
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^\+?[\d\s-()]{10,15}$/;
  return phoneRegex.test(phone);
}
