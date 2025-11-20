import { NextResponse } from 'next/server';
import Supplier from '@/app/models/Supplier';
import connectDB from '@/app/lib/mongodb';

export async function GET() {
  try {
    
    const suppliers = await Supplier.find();
    return NextResponse.json(suppliers);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    
    const body = await request.json();
    const supplier = await Supplier.create(body);
    return NextResponse.json(supplier, { status: 201 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
