import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export interface JWTPayload {
  vendorId: string;
  phone: string;
  name: string;
}

export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    return null;
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Generate random OTP
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Simple OTP storage (in production, use Redis or database)
const otpStore = new Map<string, { otp: string; expires: number }>();

export function storeOTP(phone: string, otp: string): void {
  const expires = Date.now() + 5 * 60 * 1000; // 5 minutes
  otpStore.set(phone, { otp, expires });
}

export function verifyOTP(phone: string, otp: string): boolean {
  const stored = otpStore.get(phone);
  if (!stored) return false;
  
  if (Date.now() > stored.expires) {
    otpStore.delete(phone);
    return false;
  }
  
  if (stored.otp === otp) {
    otpStore.delete(phone);
    return true;
  }
  
  return false;
}