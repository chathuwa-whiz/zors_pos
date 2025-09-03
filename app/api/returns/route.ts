import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/app/lib/mongodb';
import Product from '@/app/models/Product';

interface ProductReturn {
  _id?: string;
  productId: string;
  product: {
    _id: string;
    name: string;
    sellingPrice: number;
  };
  returnType: 'customer' | 'supplier';
  quantity: number;
  reason: string;
  cashier: {
    _id: string;
    username: string;
  };
  createdAt: Date;
  notes?: string;
}

// In-memory storage for returns (in production, use MongoDB)
const returns: ProductReturn[] = [];

export async function GET() {
  try {
    // In production, fetch from database
    return NextResponse.json(returns.reverse()); // Most recent first
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const body = await request.json();
    const { productId, returnType, quantity, reason, notes } = body;

    // Validate required fields
    if (!productId || !returnType || !quantity || !reason) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Find the product
    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Validate quantity
    const returnQuantity = parseInt(quantity);
    if (isNaN(returnQuantity) || returnQuantity <= 0) {
      return NextResponse.json(
        { error: 'Invalid quantity' },
        { status: 400 }
      );
    }

    // For supplier returns, check if enough stock is available
    if (returnType === 'supplier' && returnQuantity > product.stock) {
      return NextResponse.json(
        { error: 'Insufficient stock for return' },
        { status: 400 }
      );
    }

    // Update product stock based on return type
    let newStock;
    if (returnType === 'customer') {
      // Customer return increases stock
      newStock = product.stock + returnQuantity;
    } else {
      // Supplier return decreases stock
      newStock = product.stock - returnQuantity;
    }

    // Update product stock in database
    await Product.findByIdAndUpdate(productId, { stock: newStock });

    // Get user info from request headers (passed from frontend)
    const userInfoHeader = request.headers.get('x-user-info');
    let user;
    
    if (userInfoHeader) {
      try {
        user = JSON.parse(userInfoHeader);
      } catch (err) {
        return NextResponse.json(
          { error: 'Invalid user info format' },
          { status: 400 }
        );
      }
    } else {
      return NextResponse.json(
        { error: 'User information required' },
        { status: 400 }
      );
    }

    // Create return record with actual user data
    const productReturn: ProductReturn = {
      _id: Date.now().toString(),
      productId,
      product: {
        _id: product._id.toString(),
        name: product.name,
        sellingPrice: product.sellingPrice
      },
      returnType,
      quantity: returnQuantity,
      reason,
      cashier: {
        _id: user._id,
        username: user.username
      },
      createdAt: new Date(),
      notes
    };

    // Store return record (in production, save to database)
    returns.push(productReturn);

    return NextResponse.json(
      { 
        message: 'Return processed successfully',
        return: productReturn,
        newStock 
      }, 
      { status: 201 }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}