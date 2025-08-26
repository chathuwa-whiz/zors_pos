import { NextResponse } from 'next/server';
import Supplier from '@/app/models/Supplier';
import connectDB from '@/app/lib/mongodb';

export async function GET() {
  try {
    await connectDB();
    const suppliers = await Supplier.find();
    return NextResponse.json(suppliers);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch suppliers' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const supplier = await Supplier.create(body);
    return NextResponse.json(supplier, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create supplier' }, { status: 500 });
  }
}
