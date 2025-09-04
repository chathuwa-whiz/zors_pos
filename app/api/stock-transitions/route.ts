import connectDB from "@/app/lib/mongodb";
import StockTransition from "@/app/models/StockTransition";
import Product from "@/app/models/Product";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    try {
        await connectDB();

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '50');
        const productId = searchParams.get('productId');
        const transactionType = searchParams.get('transactionType');
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');

        // Build filter object
        const filter: any = {};

        if (productId) {
            filter.productId = productId;
        }

        if (transactionType && transactionType !== 'all') {
            filter.transactionType = transactionType;
        }

        if (startDate || endDate) {
            filter.createdAt = {};
            if (startDate) {
                filter.createdAt.$gte = new Date(startDate);
            }
            if (endDate) {
                filter.createdAt.$lte = new Date(endDate);
            }
        }

        const skip = (page - 1) * limit;

        const [transitions, total] = await Promise.all([
            StockTransition.find(filter)
                .populate('productId', 'name barcode category')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            StockTransition.countDocuments(filter)
        ]);

        return NextResponse.json({
            transitions,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error('Error fetching stock transitions:', error);
        return NextResponse.json(
            { error: 'Failed to fetch stock transitions' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        await connectDB();

        const {
            productId,
            transactionType,
            quantity,
            unitPrice = 0,
            reference,
            party,
            userId,
            userName,
            notes = ''
        } = await request.json();

        // Validate required fields
        if (!productId || !transactionType || !quantity || !userId || !userName) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Get current product stock
        const product = await Product.findById(productId);
        if (!product) {
            return NextResponse.json(
                { error: 'Product not found' },
                { status: 404 }
            );
        }

        const previousStock = product.stock;
        let newStock = previousStock;

        // Calculate new stock based on transaction type
        switch (transactionType) {
            case 'sale':
            case 'supplier_return':
                newStock = previousStock - quantity;
                break;
            case 'purchase':
            case 'customer_return':
                newStock = previousStock + quantity;
                break;
            case 'adjustment':
                newStock = quantity; // Direct stock adjustment
                break;
            default:
                return NextResponse.json(
                    { error: 'Invalid transaction type' },
                    { status: 400 }
                );
        }

        // Validate stock doesn't go negative
        if (newStock < 0) {
            return NextResponse.json(
                { error: 'Insufficient stock for this transaction' },
                { status: 400 }
            );
        }

        // Create stock transition record
        const stockTransition = new StockTransition({
            productId,
            productName: product.name,
            transactionType,
            quantity: Math.abs(quantity),
            previousStock,
            newStock,
            unitPrice,
            totalValue: Math.abs(quantity) * unitPrice,
            reference,
            party,
            user: userId,
            userName,
            notes
        });

        await stockTransition.save();

        // Update product stock
        await Product.findByIdAndUpdate(productId, { stock: newStock });

        return NextResponse.json(stockTransition, { status: 201 });

    } catch (error) {
        console.error('Error creating stock transition:', error);
        return NextResponse.json(
            { error: 'Failed to create stock transition' },
            { status: 500 }
        );
    }
}