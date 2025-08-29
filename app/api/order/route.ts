import connectDB from "@/app/lib/mongodb";
import OrderModel from "@/app/models/Order";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        await connectDB();

        const orders = await OrderModel.find();

        return NextResponse.json(orders);
    } catch (error) {
        return NextResponse.error();
    }
}

export  async function POST(req: NextRequest) {
    try {
        await connectDB();

        const body = await req.json();

        const newOrder = new OrderModel(body);
        await newOrder.save();

        return NextResponse.json(newOrder);
    } catch (error) {
        return NextResponse.error();
    }
}