import { uploadImageToCloudinary } from "@/app/lib/cloudinary";
import connectDB from "@/app/lib/mongodb";
import Product from "@/app/models/Product";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    
    let query: any = {};
    
    // Build search query including barcode
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
        { barcode: { $regex: search, $options: 'i' } }, // Add barcode search
      ];
    }
    
    // Category filter
    if (category && category !== 'all') {
      query.category = category;
    }
    
    const products = await Product.find(query).sort({ createdAt: -1 });
    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
    try {
        await connectDB();

        const formData = await req.formData();

        const file = formData.get("image") as File;

        // Validate file type
        if (file && !file.type.startsWith('image/')) {
            return NextResponse.json({ error: 'File must be an image' }, { status: 400 });
        }

        // Validate file size (5MB limit)
        if (file && file.size > 5 * 1024 * 1024) {
            return NextResponse.json({ error: 'File size must be less than 5MB' }, { status: 400 });
        }

        // Extract product data from FormData
        const productData: {
            name: string;
            costPrice: number;
            sellingPrice: number;
            discount: number;
            category: string;
            size?: string;
            dryfood: boolean;
            stock: number;
            description?: string;
            image?: string;
            imagePublicId?: string;
            supplier?: string; // Add supplier field
            barcode?: string; // Add barcode field
        } = {
            name: formData.get("name") as string,
            costPrice: Number(formData.get("costPrice")),
            sellingPrice: Number(formData.get("sellingPrice")),
            discount: formData.get("discount") ? Number(formData.get("discount")) : 0,
            category: formData.get("category") as string,
            size: formData.get("size") as string || undefined,
            dryfood: formData.get("dryfood") === 'true',
            stock: Number(formData.get("stock")),
            description: formData.get("description") as string || undefined,
            supplier: formData.get("supplier") as string || undefined, // Handle supplier
            barcode: formData.get("barcode") as string || undefined, // Handle barcode
        };

        // Only add barcode to productData if it's provided and not empty
        if (productData.barcode && productData.barcode.trim() !== '') {
            // Check if a product with the same barcode already exists
            const existingProduct = await Product.findOne({ barcode: productData.barcode });
            if (existingProduct) {
                return NextResponse.json({ error: 'Barcode already exists' }, { status: 400 });
            }
        } else {
            delete productData.barcode; // Remove barcode from productData if not provided
        }

        // Upload image to Cloudinary if file is provided
        if (file && file.size > 0) {
            const uploadResult = await uploadImageToCloudinary(file, "products");
            productData.image = uploadResult.secure_url;
            productData.imagePublicId = uploadResult.public_id;
        }

        // Validate required fields
        if (!productData.name || !productData.costPrice || !productData.sellingPrice || !productData.category || productData.stock === undefined) {
            return NextResponse.json({
                error: 'Missing required fields: name, costPrice, sellingPrice, category, and stock are required'
            }, { status: 400 });
        }

        const newProduct = new Product(productData);
        await newProduct.save();

        return NextResponse.json(newProduct, { status: 201 });

    } catch (error: unknown) {
        console.error("Error creating product:", error);
        return NextResponse.json(
            { message: "Internal Server Error" },
            { status: 500 }
        );
    }
}