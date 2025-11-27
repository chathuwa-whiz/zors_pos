import bcrypt from "bcryptjs";
import User from "@/app/models/User";
import { LoginRequest } from "@/app/types/user";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectDB from "@/app/lib/mongodb";

export async function POST(req: NextRequest) {

    try {
        await connectDB();
        
        const { username, password }: LoginRequest = await req.json();

        // validations
        if (!username || !password) {
            return NextResponse.json({ message: 'All fields are required' }, { status: 400 });
        }

        // find user
        const user = await User.findOne({ username });
        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 401 });
        }

        // check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
        }

        // generate JWT token - expires after 30 days
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            throw new Error("JWT_SECRET environment variable is not defined");
        }
        const token = jwt.sign(
            { id: user._id, username: user.username, role: user.role }, 
            secret, 
            { expiresIn: '30d' }
        );

        // Create user object without password
        const userResponse = {
            _id: user._id,
            username: user.username,
            role: user.role,
            email: user.email
        };

        // give response
        return NextResponse.json({ user: userResponse, token });

    } catch (error: unknown) {
        console.error('Login error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Internal server error';
        return NextResponse.json({ message: errorMessage }, { status: 500 });
    }

}