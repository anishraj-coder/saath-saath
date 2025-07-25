import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { vendorUpdateSchema } from '@/lib/validations';

// Get vendor profile
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization token required' },
        { status: 401 }
      );
    }
    
    const token = authHeader.substring(7);
    const payload = verifyToken(token);
    
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }
    
    const vendor = await prisma.vendor.findUnique({
      where: { id: payload.vendorId },
      select: {
        id: true,
        name: true,
        phone: true,
        stallLatitude: true,
        stallLongitude: true,
        stallAddress: true,
        verificationStatus: true,
        creditLimit: true,
        totalSavings: true,
        createdAt: true,
        updatedAt: true
      }
    });
    
    if (!vendor) {
      return NextResponse.json(
        { error: 'Vendor not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ vendor });
    
  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Update vendor profile
export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization token required' },
        { status: 401 }
      );
    }
    
    const token = authHeader.substring(7);
    const payload = verifyToken(token);
    
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    const validatedData = vendorUpdateSchema.parse(body);
    
    const updatedVendor = await prisma.vendor.update({
      where: { id: payload.vendorId },
      data: validatedData,
      select: {
        id: true,
        name: true,
        phone: true,
        stallLatitude: true,
        stallLongitude: true,
        stallAddress: true,
        verificationStatus: true,
        creditLimit: true,
        totalSavings: true,
        updatedAt: true
      }
    });
    
    return NextResponse.json({
      message: 'Profile updated successfully',
      vendor: updatedVendor
    });
    
  } catch (error) {
    console.error('Profile update error:', error);
    
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