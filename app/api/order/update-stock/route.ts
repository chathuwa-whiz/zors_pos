import Product from "@/app/models/Product";
import { NextRequest, NextResponse } from "next/server";

// Define interfaces for type safety
interface Product {
    _id: string;
    name: string;
    sellingPrice: number;
    stock: number;
}

interface CartItem {
    product: Product;
    quantity: number;
}

export async function POST(req: NextRequest) {
    try {
        const { cartItems }: { cartItems: CartItem[] } = await req.json();

        if (!cartItems || !Array.isArray(cartItems)) {
            return NextResponse.json({ error: 'Invalid cart items provided' }, { status: 400 });
        }

        // Process each cart item to update stock
        const stockUpdates = [];
        const errors = [];

        for (const item of cartItems) {
            try {
                const product = await Product.findById(item.product._id);

                if (!product) {
                    errors.push(`Product with ID ${item.product._id} not found`);
                    continue;
                }

                // Check if there's enough stock
                if (product.stock < item.quantity) {
                    errors.push(`Insufficient stock for ${product.name}. Available: ${product.stock}, Required: ${item.quantity}`);
                    continue;
                }

                // Calculate new stock
                const newStock = product.stock - item.quantity;

                // Update the product stock
                const updatedProduct = await Product.findByIdAndUpdate(
                    item.product._id,
                    { stock: newStock },
                    { new: true, runValidators: true }
                );

                if (!updatedProduct) {
                    errors.push(`Failed to update stock for product ${product.name}`);
                    continue;
                }

                stockUpdates.push({
                    productId: item.product._id,
                    productName: product.name,
                    previousStock: product.stock,
                    soldQuantity: item.quantity,
                    newStock: newStock
                });

            } catch (error) {
                console.error(`Error updating stock for product ${item.product._id}:`, error);
                errors.push(`Failed to update stock for product ID ${item.product._id}`);
            }
        }

        // If there were any errors, return them
        if (errors.length > 0) {
            return NextResponse.json({
                error: 'Some stock updates failed',
                details: errors,
                successfulUpdates: stockUpdates
            }, { status: 207 }); // 207 Multi-Status
        }

        return NextResponse.json({
            message: 'Stock updated successfully',
            updates: stockUpdates
        }, { status: 200 });

    } catch (error: unknown) {
        console.error('Error updating product stock:', error);
        return NextResponse.json({ error: 'Failed to update product stock' }, { status: 500 });
    }
}