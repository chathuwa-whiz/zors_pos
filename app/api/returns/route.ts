import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/app/lib/mongodb';
import Product from '@/app/models/Product';
import Return from '@/app/models/Return';
import StockTransition from '@/app/models/StockTransition';

// Define interfaces for type safety
interface ReturnItem {
  _id: string;
  productId: {
    _id: string;
  };
  productName: string;
  returnType: 'customer' | 'supplier';
  quantity: number;
  reason: string;
  notes?: string;
  unitPrice: number;
  totalValue: number;
  cashier: {
    _id: string;
  };
  cashierName: string;
  createdAt: Date;
}

interface TransformedReturn {
  _id: string;
  product: {
    _id: string;
    name: string;
    sellingPrice: number;
  };
  returnType: 'customer' | 'supplier';
  quantity: number;
  reason: string;
  notes?: string;
  cashier: {
    _id: string;
    username: string;
  };
  createdAt: string;
  totalValue: number;
}

interface UserInfo {
  _id: string;
  username: string;
  role?: string;
}

interface ReturnRequestBody {
  productId: string;
  returnType: 'customer' | 'supplier';
  quantity: number;
  reason: string;
  notes?: string;
}

export async function GET() {
  try {
    await dbConnect();

    // Fetch returns from database with product details
    const returns = await Return.find();

    // Transform the data to match the expected format
    const transformedReturns: TransformedReturn[] = returns.map((returnItem: ReturnItem) => ({
      _id: returnItem._id.toString(),
      product: {
        _id: returnItem.productId._id.toString(),
        name: returnItem.productName,
        sellingPrice: returnItem.unitPrice
      },
      returnType: returnItem.returnType,
      quantity: returnItem.quantity,
      reason: returnItem.reason,
      notes: returnItem.notes,
      cashier: {
        _id: returnItem.cashier._id.toString(),
        username: returnItem.cashierName
      },
      createdAt: returnItem.createdAt.toISOString(),
      totalValue: returnItem.totalValue
    }));

    return NextResponse.json(transformedReturns);
  } catch (error: unknown) {
    console.error('Error fetching returns:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body: ReturnRequestBody = await request.json();
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
    const returnQuantity = parseInt(quantity.toString());
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

    // Get user info from request headers
    const userInfoHeader = request.headers.get('x-user-info');
    let user: UserInfo;

    if (userInfoHeader) {
      try {
        user = JSON.parse(userInfoHeader) as UserInfo;
      } catch (err) {
        return NextResponse.json(
          { error: 'Invalid user info format', err },
          { status: 400 }
        );
      }
    } else {
      return NextResponse.json(
        { error: 'User information required' },
        { status: 400 }
      );
    }

    // Get the previous stock before any changes
    const previousStock = product.stock;

    // Calculate new stock based on return type
    let newStock: number;
    if (returnType === 'customer') {
      // Customer return increases stock
      newStock = product.stock + returnQuantity;
    } else {
      // Supplier return decreases stock
      newStock = product.stock - returnQuantity;
    }

    // Create return record first
    const returnRecord = new Return({
      productId: product._id,
      productName: product.name,
      returnType,
      quantity: returnQuantity,
      reason,
      notes: notes || '',
      unitPrice: product.sellingPrice,
      totalValue: returnQuantity * product.sellingPrice,
      previousStock,
      newStock,
      cashier: user._id,
      cashierName: user.username,
      status: 'completed'
    });

    const savedReturn = await returnRecord.save();

    // Update product stock in database
    await Product.findByIdAndUpdate(productId, { stock: newStock });

    // Create stock transition record
    try {
      const stockTransition = new StockTransition({
        productId: product._id,
        productName: product.name,
        transactionType: returnType === 'customer' ? 'customer_return' : 'supplier_return',
        quantity: returnQuantity,
        previousStock,
        newStock,
        unitPrice: product.sellingPrice,
        totalValue: returnQuantity * product.sellingPrice,
        reference: savedReturn._id.toString(),
        party: {
          name: returnType === 'customer' ? 'Customer Return' : 'Supplier Return',
          type: returnType === 'customer' ? 'customer' : 'supplier',
          id: returnType === 'customer' ? 'customer_return' : 'supplier_return'
        },
        user: user._id,
        userName: user.username,
        notes: `${returnType === 'customer' ? 'Customer' : 'Supplier'} return - ${reason}${notes ? ` | ${notes}` : ''}`
      });

      await stockTransition.save();
      console.log('Stock transition created for return:', stockTransition._id);
    } catch (transitionError) {
      console.error('Error creating stock transition for return:', transitionError);
      // Log the error but don't fail the return process
      // In production, you might want to implement a retry mechanism
    }

    // Return the created record with proper formatting
    const responseData: TransformedReturn = {
      _id: savedReturn._id.toString(),
      product: {
        _id: product._id.toString(),
        name: product.name,
        sellingPrice: product.sellingPrice
      },
      returnType: savedReturn.returnType,
      quantity: savedReturn.quantity,
      reason: savedReturn.reason,
      notes: savedReturn.notes,
      cashier: {
        _id: user._id,
        username: user.username
      },
      createdAt: savedReturn.createdAt.toISOString(),
      totalValue: savedReturn.totalValue
    };

    return NextResponse.json(
      {
        message: 'Return processed successfully',
        return: responseData,
        newStock
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error('Error processing return:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}