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

export async function POST(req: NextRequest) {
    try {
        await connectDB();

        const body = await req.json();

        // Make sure required fields are present
        if (!body.cart || !body.cashier || !body.name || !body.orderType || body.totalAmount === undefined || !body.paymentDetails) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const newOrder = new OrderModel(body);
        await newOrder.save();

        return NextResponse.json(newOrder);
    } catch (error) {
        console.error('Error saving order:', error);
        return NextResponse.json(
            { error: 'Failed to save order' },
            { status: 500 }
        );
    }
}