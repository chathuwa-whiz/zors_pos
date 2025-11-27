import bcrypt from "bcryptjs";
import User from "@/app/models/User";
import { RegisterRequest } from "@/app/types/user";
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/app/lib/mongodb";

export async function POST(req: NextRequest) {

    try {
        await connectDB();
        
        const { email, password, username, role }: RegisterRequest = await req.json();

        // validations
        if (!email || !password || !username || !role) {
            return NextResponse.json({ message: 'All fields are required' });
        }

        if (password.length < 6) {
            return NextResponse.json({ message: 'Password must be at least 6 characters' });
        }

        if (!['admin', 'cashier'].includes(role)) {
            return NextResponse.json({ message: 'Invalid role specified' });
        }

        // check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return NextResponse.json({ message: 'User already exists' });
        }

        // hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // create the user
        const user = new User({
            email,
            password: hashedPassword,
            username,
            role
        });
        await user.save();

        // give response
        return NextResponse.json(user);

    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'Internal server error' });
    }

}