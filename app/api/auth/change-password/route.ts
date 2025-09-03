import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/app/lib/mongodb";
import User from "@/app/models/User";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  await dbConnect();
  const { oldPassword, newPassword } = await req.json();

  // Find the currently logged-in admin user (replace with your auth logic)
  // For demo, we fetch the first admin user
  const admin = await User.findOne({ role: "admin" });
  if (!admin) {
    return NextResponse.json({ error: "Admin user not found." }, { status: 404 });
  }

  // Check old password
  const isMatch = await bcrypt.compare(oldPassword, admin.password);
  if (!isMatch) {
    return NextResponse.json({ error: "Old password is incorrect." }, { status: 400 });
  }

  // Update password
  const hashed = await bcrypt.hash(newPassword, 10);
  admin.password = hashed;
  await admin.save();

  return NextResponse.json({ success: true });
}