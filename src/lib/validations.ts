import { z } from 'zod';

// Vendor registration validation
export const vendorRegistrationSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name too long'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Please enter a valid 10-digit mobile number'),
  stallLatitude: z.number().min(-90).max(90).optional(),
  stallLongitude: z.number().min(-180).max(180).optional(),
  stallAddress: z.string().max(500, 'Address too long').optional(),
});

// OTP verification validation
export const otpVerificationSchema = z.object({
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Please enter a valid 10-digit mobile number'),
  otp: z.string().length(6, 'OTP must be 6 digits'),
});

// Login validation
export const loginSchema = z.object({
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Please enter a valid 10-digit mobile number'),
});

export type VendorRegistrationInput = z.infer<typeof vendorRegistrationSchema>;
export type OTPVerificationInput = z.infer<typeof otpVerificationSchema>;
export type LoginInput = z.infer<typeof loginSchema>;