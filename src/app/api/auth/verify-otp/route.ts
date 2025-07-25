import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { otpVerificationSchema } from '@/lib/validations';
import { verifyOTP, generateToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validatedData = otpVerificationSchema.parse(body);
    
    // Verify OTP
    const isValidOTP = verifyOTP(validatedData.phone, validatedData.otp);
    
    if (!isValidOTP) {
      return NextResponse.json(
        { error: 'Invalid or expired OTP' },
        { status: 400 }
      );
    }
    
    // Find vendor
    const vendor = await prisma.vendor.findUnique({
      where: { phone: validatedData.phone }
    });
    
    if (!vendor) {
      return NextResponse.json(
        { error: 'Vendor not found' },
        { status: 404 }
      );
    }
    
    // Update verification status
    const updatedVendor = await prisma.vendor.update({
      where: { id: vendor.id },
      data: { verificationStatus: 'verified' }
    });
    
    // Generate JWT token
    const token = generateToken({
      vendorId: vendor.id,
      phone: vendor.phone,
      name: vendor.name
    });
    
    return NextResponse.json({
      message: 'Phone number verified successfully',
      token,
      vendor: {
        id: updatedVendor.id,
        name: updatedVendor.name,
        phone: updatedVendor.phone,
        stallAddress: updatedVendor.stallAddress,
        verificationStatus: updatedVendor.verificationStatus,
        creditLimit: updatedVendor.creditLimit,
        totalSavings: updatedVendor.totalSavings
      }
    });
    
  } catch (error) {
    console.error('OTP verification error:', error);
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input data', details: error },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}