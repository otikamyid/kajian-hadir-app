
import { z } from 'zod';
import { sanitizeInput, isValidEmail, isValidPhone, validatePasswordStrength } from './security';

// Enhanced validation schemas with better error messages
export const createEmailSchema = (required = true) => {
  let schema = z.string();
  
  if (required) {
    schema = schema.min(1, 'Email is required');
  }
  
  return schema
    .email('Please enter a valid email address')
    .max(254, 'Email address is too long')
    .transform(val => val.toLowerCase().trim())
    .refine(isValidEmail, 'Invalid email format');
};

export const createPasswordSchema = (minLength = 6) => {
  return z.string()
    .min(minLength, `Password must be at least ${minLength} characters long`)
    .max(128, 'Password is too long')
    .refine(
      (password) => validatePasswordStrength(password).isValid,
      (password) => ({
        message: validatePasswordStrength(password).feedback.join(', ')
      })
    );
};

export const createNameSchema = (fieldName = 'Name') => {
  return z.string()
    .min(1, `${fieldName} is required`)
    .min(2, `${fieldName} must be at least 2 characters long`)
    .max(100, `${fieldName} must be less than 100 characters`)
    .transform(sanitizeInput)
    .refine(
      (val) => val.length >= 2,
      `${fieldName} must be at least 2 characters after sanitization`
    );
};

export const createPhoneSchema = () => {
  return z.string()
    .min(1, 'Phone number is required')
    .max(20, 'Phone number is too long')
    .transform(val => val.replace(/[^\d+\-\s()]/g, ''))
    .refine(isValidPhone, 'Please enter a valid phone number');
};

export const createUrlSchema = (required = true) => {
  let schema = z.string();
  
  if (required) {
    schema = schema.min(1, 'URL is required');
  }
  
  return schema.url('Please enter a valid URL');
};

export const createDateSchema = () => {
  return z.string()
    .min(1, 'Date is required')
    .refine(
      (val) => !isNaN(Date.parse(val)),
      'Please enter a valid date'
    )
    .transform(val => new Date(val).toISOString());
};

export const createTimeSchema = () => {
  return z.string()
    .min(1, 'Time is required')
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter time in HH:MM format');
};

// Conditional validation utilities
export const createConditionalSchema = <T>(
  condition: (data: any) => boolean,
  trueSchema: z.ZodSchema<T>,
  falseSchema: z.ZodSchema<T>
) => {
  return z.any().superRefine((data, ctx) => {
    const schema = condition(data) ? trueSchema : falseSchema;
    const result = schema.safeParse(data);
    
    if (!result.success) {
      result.error.issues.forEach(issue => {
        ctx.addIssue(issue);
      });
    }
  });
};

// Cross-field validation
export const createCrossFieldValidation = <T extends Record<string, any>>(
  fields: (keyof T)[],
  validator: (values: Pick<T, keyof T>) => boolean | string
) => {
  return z.any().superRefine((data: T, ctx) => {
    const fieldValues = fields.reduce((acc, field) => {
      acc[field] = data[field];
      return acc;
    }, {} as Pick<T, keyof T>);

    const result = validator(fieldValues);
    
    if (typeof result === 'string') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: result,
        path: fields as string[]
      });
    } else if (result === false) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Cross-field validation failed',
        path: fields as string[]
      });
    }
  });
};

// File validation
export const createFileSchema = (
  maxSize: number = 10 * 1024 * 1024, // 10MB default
  allowedTypes: string[] = ['image/jpeg', 'image/png', 'image/gif']
) => {
  return z.instanceof(File)
    .refine(
      (file) => file.size <= maxSize,
      `File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`
    )
    .refine(
      (file) => allowedTypes.includes(file.type),
      `File type must be one of: ${allowedTypes.join(', ')}`
    );
};

// Array validation utilities
export const createArraySchema = <T>(
  itemSchema: z.ZodSchema<T>,
  minItems = 0,
  maxItems = 100
) => {
  return z.array(itemSchema)
    .min(minItems, `At least ${minItems} items required`)
    .max(maxItems, `Maximum ${maxItems} items allowed`);
};

// Common validation patterns
export const ValidationPatterns = {
  // Indonesian phone number
  indonesianPhone: /^(\+62|62|0)[0-9]{8,13}$/,
  
  // Strong password (at least 8 chars, 1 upper, 1 lower, 1 number, 1 special)
  strongPassword: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  
  // Indonesian ID card (KTP)
  indonesianId: /^[0-9]{16}$/,
  
  // Indonesian postal code
  indonesianPostalCode: /^[0-9]{5}$/,
  
  // Time format (24 hour)
  time24: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
  
  // Date format (YYYY-MM-DD)
  dateISO: /^\d{4}-\d{2}-\d{2}$/,
  
  // Hex color
  hexColor: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
  
  // UUID
  uuid: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
};

// Validation error formatter
export function formatValidationErrors(errors: z.ZodError): Record<string, string> {
  const formattedErrors: Record<string, string> = {};
  
  errors.errors.forEach((error) => {
    const path = error.path.join('.');
    formattedErrors[path] = error.message;
  });
  
  return formattedErrors;
}

// Async validation utilities
export async function validateAsync<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): Promise<{ success: true; data: T } | { success: false; errors: Record<string, string> }> {
  try {
    const result = await schema.parseAsync(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: formatValidationErrors(error) };
    }
    throw error;
  }
}
