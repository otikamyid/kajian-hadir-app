
// Enhanced encryption utilities for localStorage with better security
import CryptoJS from 'crypto-js';

const ENCRYPTION_KEY = 'kajian-hadir-key-v2';
const IV_LENGTH = 16; // For AES, this is always 16

// Generate a random salt for better security
function generateSalt(): string {
  return CryptoJS.lib.WordArray.random(128/8).toString();
}

// Enhanced encryption with salt and IV
export function encryptData(data: any): string {
  try {
    const jsonString = JSON.stringify(data);
    const salt = generateSalt();
    const key = CryptoJS.PBKDF2(ENCRYPTION_KEY, salt, {
      keySize: 256/32,
      iterations: 1000
    });
    
    const iv = CryptoJS.lib.WordArray.random(IV_LENGTH);
    const encrypted = CryptoJS.AES.encrypt(jsonString, key, { iv: iv });
    
    // Combine salt, iv, and encrypted data
    const result = salt + ':' + iv.toString() + ':' + encrypted.toString();
    return btoa(result);
  } catch (error) {
    console.error('Encryption error:', error);
    return '';
  }
}

export function decryptData(encryptedData: string): any {
  try {
    const decoded = atob(encryptedData);
    const [salt, ivString, encrypted] = decoded.split(':');
    
    if (!salt || !ivString || !encrypted) {
      throw new Error('Invalid encrypted data format');
    }
    
    const key = CryptoJS.PBKDF2(ENCRYPTION_KEY, salt, {
      keySize: 256/32,
      iterations: 1000
    });
    
    const iv = CryptoJS.enc.Hex.parse(ivString);
    const decrypted = CryptoJS.AES.decrypt(encrypted, key, { iv: iv });
    const decryptedString = decrypted.toString(CryptoJS.enc.Utf8);
    
    if (!decryptedString) {
      throw new Error('Failed to decrypt data');
    }
    
    return JSON.parse(decryptedString);
  } catch (error) {
    console.error('Decryption error:', error);
    return null;
  }
}

// Secure localStorage wrapper with error handling
export const secureStorage = {
  setItem: (key: string, value: any) => {
    try {
      const encrypted = encryptData(value);
      if (encrypted) {
        localStorage.setItem(key, encrypted);
        return true;
      }
      return false;
    } catch (error) {
      console.error('SecureStorage setItem error:', error);
      return false;
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
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('SecureStorage removeItem error:', error);
      return false;
    }
  },

  clear: () => {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error('SecureStorage clear error:', error);
      return false;
    }
  }
};

// Enhanced input sanitization
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return '';
  
  return input
    .trim()
    .replace(/[<>'"&]/g, (char) => {
      switch (char) {
        case '<': return '&lt;';
        case '>': return '&gt;';
        case '"': return '&quot;';
        case "'": return '&#x27;';
        case '&': return '&amp;';
        default: return char;
      }
    })
    .substring(0, 1000); // Limit length
}

// HTML sanitization for rich text
export function sanitizeHtml(html: string): string {
  if (typeof html !== 'string') return '';
  
  // Basic HTML sanitization - remove script tags and dangerous attributes
  return html
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
    .replace(/<object[^>]*>.*?<\/object>/gi, '')
    .replace(/<embed[^>]*>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/on\w+='[^']*'/gi, '')
    .substring(0, 5000);
}

// Enhanced email validation with domain check
export function isValidEmail(email: string): boolean {
  if (typeof email !== 'string') return false;
  
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  
  if (!emailRegex.test(email)) return false;
  
  // Additional checks
  const parts = email.split('@');
  if (parts.length !== 2) return false;
  
  const [localPart, domain] = parts;
  if (localPart.length > 64 || domain.length > 253) return false;
  
  return true;
}

// Enhanced phone validation with international support
export function isValidPhone(phone: string): boolean {
  if (typeof phone !== 'string') return false;
  
  // Remove all non-digit characters except + for country code
  const cleanPhone = phone.replace(/[^\d+]/g, '');
  
  // Check for valid international format
  const phoneRegex = /^\+?[\d]{10,15}$/;
  return phoneRegex.test(cleanPhone);
}

// URL validation
export function isValidUrl(url: string): boolean {
  if (typeof url !== 'string') return false;
  
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// Password strength validation
export function validatePasswordStrength(password: string): {
  isValid: boolean;
  score: number;
  feedback: string[];
} {
  if (typeof password !== 'string') {
    return { isValid: false, score: 0, feedback: ['Password must be a string'] };
  }

  const feedback: string[] = [];
  let score = 0;

  if (password.length >= 8) score += 1;
  else feedback.push('Password must be at least 8 characters long');

  if (/[a-z]/.test(password)) score += 1;
  else feedback.push('Password must contain lowercase letters');

  if (/[A-Z]/.test(password)) score += 1;
  else feedback.push('Password must contain uppercase letters');

  if (/\d/.test(password)) score += 1;
  else feedback.push('Password must contain numbers');

  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1;
  else feedback.push('Password must contain special characters');

  return {
    isValid: score >= 4,
    score,
    feedback
  };
}

// Rate limiting utility
export class RateLimiter {
  private attempts: Map<string, number[]> = new Map();
  
  constructor(
    private maxAttempts: number = 5,
    private windowMs: number = 15 * 60 * 1000 // 15 minutes
  ) {}
  
  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const userAttempts = this.attempts.get(identifier) || [];
    
    // Remove old attempts
    const validAttempts = userAttempts.filter(time => now - time < this.windowMs);
    
    if (validAttempts.length >= this.maxAttempts) {
      return false;
    }
    
    // Add current attempt
    validAttempts.push(now);
    this.attempts.set(identifier, validAttempts);
    
    return true;
  }
  
  reset(identifier: string): void {
    this.attempts.delete(identifier);
  }
}

export const authRateLimiter = new RateLimiter(5, 15 * 60 * 1000); // 5 attempts per 15 minutes
