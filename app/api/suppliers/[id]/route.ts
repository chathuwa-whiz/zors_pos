import { NextResponse } from 'next/server';
import Supplier from '@/models/Supplier';
import dbConnect from '@/lib/mongodb';

export async function PUT(request: Request, context: { params: { id: string } }) {
  await dbConnect();
  const { params } = await context;
  try {
    const body = await request.json();
    const supplier = await Supplier.findByIdAndUpdate(params.id, body, { new: true });
    if (!supplier) return NextResponse.json({ error: 'Supplier not found' }, { status: 404 });
    return NextResponse.json(supplier);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update supplier' }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: { params: { id: string } }) {
  await dbConnect();
  const { params } = await context;
  try {
    const supplier = await Supplier.findByIdAndDelete(params.id);
    if (!supplier) return NextResponse.json({ error: 'Supplier not found' }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete supplier' }, { status: 500 });
  }
}
