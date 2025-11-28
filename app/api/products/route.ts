import { uploadImageToCloudinary } from "@/app/lib/cloudinary";
import connectDB from "@/app/lib/mongodb";
import Product from "@/app/models/Product";
import StockTransition from "@/app/models/StockTransition";
import { NextRequest, NextResponse } from "next/server";

// Add barcode generator function at the top
const generateBarcode = (): string => {
  // Generate a 13-digit EAN-13 style barcode
  const timestamp = Date.now().toString();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  const barcode = (timestamp.slice(-7) + random + '000').slice(0, 13);
  return barcode;
};

// Define interface for MongoDB query
interface ProductQuery {
  $or?: Array<{
    name?: { $regex: string; $options: string };
    description?: { $regex: string; $options: string };
    category?: { $regex: string; $options: string };
    barcode?: { $regex: string; $options: string };
  }>;
  category?: string;
}

export async function GET(request: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const category = searchParams.get('category');

    const query: ProductQuery = {};

    // Build search query including barcode
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
        { barcode: { $regex: search, $options: 'i' } },
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

    // Parse values from FormData
    const discountValue = formData.get("discount");
    const sizeValue = formData.get("size") as string;
    const dryfoodValue = formData.get("dryfood");

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
      supplier?: string;
      barcode?: string;
    } = {
      name: formData.get("name") as string,
      costPrice: Number(formData.get("costPrice")),
      sellingPrice: Number(formData.get("sellingPrice")),
      discount: discountValue ? Number(discountValue) : 0,
      category: formData.get("category") as string,
      dryfood: dryfoodValue === 'true',
      stock: Number(formData.get("stock")),
      description: (formData.get("description") as string) || undefined,
      supplier: (formData.get("supplier") as string) || undefined,
      barcode: (formData.get("barcode") as string) || undefined,
    };

    // Only add size if it's a non-empty string
    if (sizeValue && sizeValue.trim() !== '') {
      productData.size = sizeValue.trim();
    }

    // Only add barcode to productData if it's provided and not empty
    if (productData.barcode && productData.barcode.trim() !== '') {
      // Check if a product with the same barcode already exists
      const existingProduct = await Product.findOne({ barcode: productData.barcode });
      if (existingProduct) {
        return NextResponse.json({ error: 'Barcode already exists' }, { status: 400 });
      }
    } else {
      delete productData.barcode;
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

    // Auto-generate barcode if not provided
    if (!productData.barcode || productData.barcode.trim() === '') {
      let generatedBarcode;
      let isUnique = false;

      do {
        generatedBarcode = generateBarcode();
        const existingProduct = await Product.findOne({ barcode: generatedBarcode });
        isUnique = !existingProduct;
      } while (!isUnique);

      productData.barcode = generatedBarcode;
    } else {
      const existingProduct = await Product.findOne({ barcode: productData.barcode });
      if (existingProduct) {
        return NextResponse.json({ error: 'Barcode already exists' }, { status: 400 });
      }
    }

    console.log('Product data to save:', productData); // Debug log

    // Create product with explicit field assignment to ensure all fields are included
    const newProduct = new Product({
      name: productData.name,
      description: productData.description,
      category: productData.category,
      costPrice: productData.costPrice,
      sellingPrice: productData.sellingPrice,
      stock: productData.stock,
      barcode: productData.barcode,
      image: productData.image,
      supplier: productData.supplier,
      discount: productData.discount,
      size: productData.size,
      dryfood: productData.dryfood,
    });
    
    const savedProduct = await newProduct.save();
    console.log('Saved product:', savedProduct.toObject()); // Debug log to verify saved data

    // Create stock transition for initial stock if stock > 0
    if (savedProduct.stock > 0) {
      try {
        const stockTransition = new StockTransition({
          productId: savedProduct._id,
          productName: savedProduct.name,
          transactionType: 'purchase', // Initial stock is treated as a purchase
          quantity: savedProduct.stock,
          previousStock: 0,
          newStock: savedProduct.stock,
          unitPrice: savedProduct.costPrice || 0,
          totalValue: savedProduct.stock * (savedProduct.costPrice || 0),
          reference: `PRODUCT_CREATED_${savedProduct._id}`,
          party: {
            name: 'System',
            type: 'system',
            id: 'system'
          },
          user: formData.get('userId') || 'system',
          userName: formData.get('userName') as string || 'System',
          notes: `Initial stock added for new product: ${savedProduct.name}`
        });
        await stockTransition.save();
      } catch (transitionError) {
        console.error('Error creating stock transition for new product:', transitionError);
      }
    }

    return NextResponse.json(savedProduct, { status: 201 });

  } catch (error: unknown) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}