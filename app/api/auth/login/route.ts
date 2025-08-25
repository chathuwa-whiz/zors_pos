import bcrypt from "bcryptjs";
import connectDB from "@/app/lib/mongodb";
import User from "@/app/models/User";
import { LoginRequest } from "@/app/types/user";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function POST(req: NextRequest) {

    try {

        await connectDB();

        const { username, password }: LoginRequest = await req.json();

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

        // generate JWT token
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            throw new Error("JWT_SECRET environment variable is not defined");
        }
        const token = jwt.sign(
            { id: user._id, username: user.username, role: user.role }, 
            secret, 
            { expiresIn: '24h' }
        );

        // give response
        return NextResponse.json({ user, token });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'Internal server error' });
    }

}