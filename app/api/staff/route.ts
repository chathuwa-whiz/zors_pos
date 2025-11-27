import { NextResponse } from "next/server";
import Staff from "@/app/models/Staff";
import connectDB from "@/app/lib/mongodb";

export async function GET() {
  await connectDB();
  const staff = await Staff.find();
  return NextResponse.json({ data: staff });
}

export async function POST(request: Request) {
  await connectDB();
  const body = await request.json();
  const newStaff = await Staff.create(body);
  return NextResponse.json({ data: newStaff }, { status: 201 });
}