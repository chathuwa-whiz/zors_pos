import { NextResponse } from "next/server";
import dbConnect from "@/app/lib/mongodb";
import Staff from "@/models/Staff";

export async function GET() {
  await dbConnect();
  const staff = await Staff.find();
  return NextResponse.json({ data: staff });
}

export async function POST(request: Request) {
  await dbConnect();
  const body = await request.json();
  const newStaff = await Staff.create(body);
  return NextResponse.json({ data: newStaff }, { status: 201 });
}