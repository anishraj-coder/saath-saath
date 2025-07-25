import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    const payload = verifyToken(token);

    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Fetch vendor profile
    const vendor = await prisma.vendor.findUnique({
      where: { id: payload.vendorId },
      select: {
        id: true,
        name: true,
        phone: true,
        stallAddress: true,
        stallLatitude: true,
        stallLongitude: true,
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

    return NextResponse.json({
      vendor
    });

  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
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
    
    // Update vendor profile
    const updatedVendor = await prisma.vendor.update({
      where: { id: payload.vendorId },
      data: {
        name: body.name,
        stallAddress: body.stallAddress,
        stallLatitude: body.stallLatitude,
        stallLongitude: body.stallLongitude,
      },
      select: {
        id: true,
        name: true,
        phone: true,
        stallAddress: true,
        stallLatitude: true,
        stallLongitude: true,
        verificationStatus: true,
        creditLimit: true,
        totalSavings: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return NextResponse.json({
      message: 'Profile updated successfully',
      vendor: updatedVendor
    });

  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}