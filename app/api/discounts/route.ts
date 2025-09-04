import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/lib/mongodb';
import Discount from '@/app/models/Discount';
import jwt from 'jsonwebtoken';

// JWT verification helper
const verifyToken = (token: string) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not defined');
  }
  return jwt.verify(token, secret);
};

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Get authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const decoded: any = verifyToken(token);
    const userRole = decoded.role;

    // Only admins can fetch all discounts
    if (userRole !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const discounts = await Discount.find();
    return NextResponse.json(discounts);
  } catch (error: unknown) {
    console.error('Error fetching discounts:', error);
    
    // Handle specific JWT errors
    if (error instanceof jwt.TokenExpiredError) {
      return NextResponse.json({ error: 'Token expired' }, { status: 401 });
    }
    
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Get authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const decoded: any = verifyToken(token);
    const userRole = decoded.role;

    // Only admins can create discounts
    if (userRole !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { name, percentage, isGlobal } = body;

    // Validate required fields
    if (!name || percentage === undefined) {
      return NextResponse.json(
        { error: 'Name and percentage are required' },
        { status: 400 }
      );
    }

    // Validate percentage
    const discountPercentage = Number(percentage);
    if (isNaN(discountPercentage) || discountPercentage < 0 || discountPercentage > 100) {
      return NextResponse.json(
        { error: 'Percentage must be between 0 and 100' },
        { status: 400 }
      );
    }

    // If setting a global discount, unset any existing global discount
    if (isGlobal) {
      await Discount.updateMany({ isGlobal: true }, { isGlobal: false });
    }

    const newDiscount = new Discount({
      name,
      percentage: discountPercentage,
      isGlobal: isGlobal || false,
    });

    await newDiscount.save();

    return NextResponse.json(newDiscount, { status: 201 });
  } catch (error: unknown) {
    console.error('Error creating discount:', error);
    
    // Handle specific JWT errors
    if (error instanceof jwt.TokenExpiredError) {
      return NextResponse.json({ error: 'Token expired' }, { status: 401 });
    }
    
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connectDB();

    // Get authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const decoded: any = verifyToken(token);
    const userRole = decoded.role;

    // Only admins can update discounts
    if (userRole !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { id, name, percentage, isGlobal } = body;

    // Validate required fields
    if (!id) {
      return NextResponse.json(
        { error: 'Discount ID is required' },
        { status: 400 }
      );
    }

    // Validate percentage if provided
    let discountPercentage;
    if (percentage !== undefined) {
      discountPercentage = Number(percentage);
      if (isNaN(discountPercentage) || discountPercentage < 0 || discountPercentage > 100) {
        return NextResponse.json(
          { error: 'Percentage must be between 0 and 100' },
          { status: 400 }
        );
      }
    }

    // If setting a global discount, unset any existing global discount (except the current one)
    if (isGlobal) {
      await Discount.updateMany({ isGlobal: true, _id: { $ne: id } }, { isGlobal: false });
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (percentage !== undefined) updateData.percentage = discountPercentage;
    if (isGlobal !== undefined) updateData.isGlobal = isGlobal;

    const updatedDiscount = await Discount.findByIdAndUpdate(
      id,
      { ...updateData, updatedAt: new Date() },
      { new: true }
    );

    if (!updatedDiscount) {
      return NextResponse.json({ error: 'Discount not found' }, { status: 404 });
    }

    return NextResponse.json(updatedDiscount);
  } catch (error: unknown) {
    console.error('Error updating discount:', error);
    
    // Handle specific JWT errors
    if (error instanceof jwt.TokenExpiredError) {
      return NextResponse.json({ error: 'Token expired' }, { status: 401 });
    }
    
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await connectDB();

    // Get authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const decoded: any = verifyToken(token);
    const userRole = decoded.role;

    // Only admins can delete discounts
    if (userRole !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Discount ID is required' }, { status: 400 });
    }

    const deletedDiscount = await Discount.findByIdAndDelete(id);

    if (!deletedDiscount) {
      return NextResponse.json({ error: 'Discount not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Discount deleted successfully' });
  } catch (error: unknown) {
    console.error('Error deleting discount:', error);
    
    // Handle specific JWT errors
    if (error instanceof jwt.TokenExpiredError) {
      return NextResponse.json({ error: 'Token expired' }, { status: 401 });
    }
    
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}