import { NextResponse, NextRequest } from "next/server";
import connectDB from "@/app/lib/mongodb";
import Staff from "@/app/models/Staff";

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();

    const { id } = await context.params;
    const body = await req.json();

    const updated = await Staff.findByIdAndUpdate(id, body, { new: true });
    if (!updated) {
      return NextResponse.json({ error: "Staff member not found" }, { status: 404 });
    }

    return NextResponse.json({ data: updated });

  } catch (error) {
    console.error("Error connecting to database:", error);
    return NextResponse.json({ error: "Database connection error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();

    const { id } = await context.params;
    const deleted = await Staff.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ error: "Staff member not found" }, { status: 404 });
    }
    return NextResponse.json({ message: "Staff member deleted successfully" });
  } catch (error) {
    console.error("Error connecting to database:", error);
    return NextResponse.json({ error: "Database connection error" }, { status: 500 });
  }
}