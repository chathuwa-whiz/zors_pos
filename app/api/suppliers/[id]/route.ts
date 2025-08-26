import { NextRequest, NextResponse } from 'next/server';
import Supplier from '@/app/models/Supplier';
import connectDB from '@/app/lib/mongodb';

export async function PUT(request: NextRequest, context: { params: Promise<{ id: String }> }) {
  try {
    await connectDB();
    const body = await request.json();
    const { id } = await context.params;
    const supplier = await Supplier.findByIdAndUpdate(id, body, { new: true });
    if (!supplier) return NextResponse.json({ error: 'Supplier not found' }, { status: 404 });
    return NextResponse.json(supplier);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update supplier' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: String }> }) {
  try {
    await connectDB();
    const { id } = await context.params;
    const supplier = await Supplier.findByIdAndDelete(id);
    if (!supplier) return NextResponse.json({ error: 'Supplier not found' }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete supplier' }, { status: 500 });
  }
}
