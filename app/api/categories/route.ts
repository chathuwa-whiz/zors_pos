import { NextResponse } from 'next/server';
import Category from '@/models/Category';
import dbConnect from '@/app/lib/mongodb';

export async function GET() {
  try {
    await dbConnect();
    const categories = await Category.find();
    return NextResponse.json({ success: true, data: categories });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();
    if (!body.name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }
    const category = await Category.create({ name: body.name });
    return NextResponse.json({ success: true, data: category }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}