import { NextRequest, NextResponse } from 'next/server';
import Supplier from '@/app/models/Supplier';
import connectDB from '@/app/lib/mongodb';

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    
    const body = await request.json();
    const { id } = await context.params;
    const supplier = await Supplier.findByIdAndUpdate(id, body, { new: true });
    if (!supplier) return NextResponse.json({ error: 'Supplier not found' }, { status: 404 });
    return NextResponse.json(supplier);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    
    const { id } = await context.params;
    const supplier = await Supplier.findByIdAndDelete(id);
    if (!supplier) return NextResponse.json({ error: 'Supplier not found' }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}