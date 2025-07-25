import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { vendorRegistrationSchema } from '@/lib/validations';
import { generateOTP, storeOTP } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validatedData = vendorRegistrationSchema.parse(body);
    
    // Check if vendor already exists
    const existingVendor = await prisma.vendor.findUnique({
      where: { phone: validatedData.phone }
    });
    
    if (existingVendor) {
      return NextResponse.json(
        { error: 'Vendor with this phone number already exists' },
        { status: 400 }
      );
    }
    
    // Generate and store OTP
    const otp = generateOTP();
    storeOTP(validatedData.phone, otp);
    
    // In production, send OTP via SMS service
    console.log(`OTP for ${validatedData.phone}: ${otp}`);
    
    // Store registration data temporarily (in production, use Redis)
    // For now, we'll create the vendor record with pending verification
    const vendor = await prisma.vendor.create({
      data: {
        name: validatedData.name,
        phone: validatedData.phone,
        stallLatitude: validatedData.stallLatitude,
        stallLongitude: validatedData.stallLongitude,
        stallAddress: validatedData.stallAddress,
        verificationStatus: 'pending'
      }
    });
    
    return NextResponse.json({
      message: 'Registration initiated. Please verify your phone number.',
      vendorId: vendor.id,
      // In production, don't send OTP in response
      otp: process.env.NODE_ENV === 'development' ? otp : undefined
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    
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