import { NextResponse } from "next/server";
import dbConnect from "@/app/lib/mongodb";
import Staff from "@/app/models/Staff";

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const body = await request.json();
  const updated = await Staff.findByIdAndUpdate(params.id, body, { new: true });
  return NextResponse.json({ data: updated });
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  await Staff.findByIdAndDelete(params.id);
  return NextResponse.json({ success: true });
}