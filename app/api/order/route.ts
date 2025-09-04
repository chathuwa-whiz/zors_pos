import connectDB from "@/app/lib/mongodb";
import OrderModel from "@/app/models/Order";
import StockTransition from "@/app/models/StockTransition";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
    try {
        await connectDB();

        const orders = await OrderModel.find();

        return NextResponse.json(orders);
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        await connectDB();

        const orderData = await req.json();

        // Validate required fields
        if (!orderData.cart || !Array.isArray(orderData.cart) || orderData.cart.length === 0) {
            return NextResponse.json({ error: 'Cart is required and must contain items' }, { status: 400 });
        }

        // Create the order
        const order = new OrderModel(orderData);
        const savedOrder = await order.save();

        // Create stock transitions for each cart item
        try {
            const stockTransitions = orderData.cart.map((item: any) => ({
                productId: item.product._id,
                productName: item.product.name,
                transactionType: 'sale',
                quantity: item.quantity,
                previousStock: item.product.stock,
                newStock: item.product.stock - item.quantity,
                unitPrice: item.product.sellingPrice,
                totalValue: item.quantity * item.product.sellingPrice,
                reference: savedOrder._id.toString(),
                party: orderData.customer?.name ? {
                    name: orderData.customer.name,
                    type: 'customer',
                    id: orderData.customer._id || 'manual'
                } : undefined,
                user: orderData.cashier._id,
                userName: orderData.cashier.username,
                notes: `Order ${orderData.orderType} - ${orderData.kitchenNote || ''}`
            }));

            await StockTransition.insertMany(stockTransitions);
        } catch (transitionError) {
            console.error('Error creating stock transitions:', transitionError);
            // Don't fail the order if stock transition creation fails
        }

        return NextResponse.json(savedOrder, { status: 201 });

    } catch (error: unknown) {
        console.error('Error creating order:', error);
        return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
    }
}