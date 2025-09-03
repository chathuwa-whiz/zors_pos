import { uploadImageToCloudinary } from "@/app/lib/cloudinary";
import connectDB from "@/app/lib/mongodb";
import Product from "@/app/models/Product";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {

    try {

        await connectDB();

        const products = await Product.find();

        return NextResponse.json(products, { status: 200 });

    } catch (error: unknown) {
        console.error("Error fetching products:", error);
        return NextResponse.json(
            { message: "Internal Server Error" },
            { status: 500 }
        );
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
        };

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