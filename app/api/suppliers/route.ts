import { NextResponse } from 'next/server';
import Supplier from '@/models/Supplier';
import dbConnect from '@/lib/mongodb';

export async function GET() {
  await dbConnect();
  try {
    const suppliers = await Supplier.find();
    return NextResponse.json(suppliers);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch suppliers' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  await dbConnect();
  try {
    const body = await request.json();
    const supplier = await Supplier.create(body);
    return NextResponse.json(supplier, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create supplier' }, { status: 500 });
  }
}
