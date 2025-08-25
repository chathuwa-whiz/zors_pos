import bcrypt from "bcryptjs";
import connectDB from "@/app/lib/mongodb";
import User from "@/app/models/User";
import { RegisterRequest } from "@/app/types/user";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {

    try {

        await connectDB();

        const { username, password }: RegisterRequest = await req.json();

        // validations
        if (!username || !password) {
            return NextResponse.json({ message: 'All fields are required' });
        }

        // find user
        const user = await User.findOne({ username });
        if (!user) {
            return NextResponse.json({ message: 'User not found' });
        }

        // check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return NextResponse.json({ message: 'Invalid credentials' });
        }

        // give response
        return NextResponse.json(user);

    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'Internal server error' });
    }

}