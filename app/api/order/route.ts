import OrderModel from "@/app/models/Order";
import StockTransition from "@/app/models/StockTransition";
import Product from "@/app/models/Product";
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/app/lib/mongodb";

// Define interfaces for type safety
interface ProductData {
    _id: string;
    name: string;
    sellingPrice: number;
    stock: number;
}

interface CartItem {
    product: ProductData;
    quantity: number;
}

interface Customer {
    _id?: string;
    name: string;
}

interface Cashier {
    _id: string;
    username: string;
}

interface OrderData {
    cart: CartItem[];
    customer?: Customer;
    cashier: Cashier;
    orderType: string;
    kitchenNote?: string;
}

interface StockTransitionData {
    productId: string;
    productName: string;
    transactionType: 'sale';
    quantity: number;
    previousStock: number;
    newStock: number;
    unitPrice: number;
    totalValue: number;
    reference: string;
    party?: {
        name: string;
        type: 'customer';
        id: string;
    };
    user?: string;
    userName: string;
    notes: string;
}

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

        const orderData: OrderData = await req.json();

        // Validate required fields
        if (!orderData.cart || !Array.isArray(orderData.cart) || orderData.cart.length === 0) {
            return NextResponse.json({ error: 'Cart is required and must contain items' }, { status: 400 });
        }

        // Fetch current stock for all products in cart BEFORE creating order
        const productIds = orderData.cart.map(item => item.product._id);
        const currentProducts = await Product.find({ _id: { $in: productIds } });
        
        // Create a map of product ID to current stock
        const stockMap = new Map<string, number>();
        currentProducts.forEach(product => {
            stockMap.set(product._id.toString(), product.stock);
        });

        // Create the order
        const order = new OrderModel(orderData);
        const savedOrder = await order.save();

        // Create stock transitions for each cart item using the fetched current stock
        try {
            const stockTransitions: StockTransitionData[] = orderData.cart.map((item: CartItem) => {
                const currentStock = stockMap.get(item.product._id.toString()) ?? item.product.stock;
                const newStock = currentStock - item.quantity;

                const transitionData: StockTransitionData = {
                    productId: item.product._id,
                    productName: item.product.name,
                    transactionType: 'sale' as const,
                    quantity: item.quantity,
                    previousStock: currentStock,
                    newStock: newStock,
                    unitPrice: item.product.sellingPrice,
                    totalValue: item.quantity * item.product.sellingPrice,
                    reference: savedOrder._id.toString(),
                    userName: orderData.cashier.username,
                    notes: `Order ${orderData.orderType}${orderData.kitchenNote ? ' - ' + orderData.kitchenNote : ''}`
                };

                // Add party info if customer exists
                if (orderData.customer?.name) {
                    transitionData.party = {
                        name: orderData.customer.name,
                        type: 'customer' as const,
                        id: orderData.customer._id || 'walk-in'
                    };
                }

                // Only add user if it's a valid ObjectId
                if (orderData.cashier._id && /^[a-fA-F0-9]{24}$/.test(orderData.cashier._id)) {
                    transitionData.user = orderData.cashier._id;
                }

                return transitionData;
            });

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