import { deleteImageFromCloudinary, uploadImageToCloudinary } from "@/app/lib/cloudinary";
import connectDB from "@/app/lib/mongodb";
import Product from "@/app/models/Product";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {

    try {
        await connectDB();

        const { id } = await context.params;

        const product = await Product.findById(id);

        if (!product) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        return NextResponse.json(product, { status: 200 });

    } catch (error: unknown) {
        console.error('Error fetching product:', error);
        return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
    }
}

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
    try {
        await connectDB();

        const { id } = await context.params;
        const formData = await req.formData();

        // get the current product
        const currentProduct = await Product.findById(id);

        if (!currentProduct) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        // Extract product data from FormData
        const updateData: {
            id?: string;
            name?: string;
            costPrice?: number;
            sellingPrice?: number;
            discount?: number;
            category?: string;
            size?: string;
            stock?: number;
            description?: string;
            dryfood?: boolean;
            image?: string;
            imagePublicId?: string;
        } = {};
        
        // Only update fields that are present in formData
        const name = formData.get('name');
        if (name !== null) updateData.name = name as string;
        
        const costPrice = formData.get('costPrice');
        if (costPrice !== null) updateData.costPrice = Number(costPrice);
        
        const sellingPrice = formData.get('sellingPrice');
        if (sellingPrice !== null) updateData.sellingPrice = Number(sellingPrice);
        
        const discount = formData.get('discount');
        if (discount !== null) updateData.discount = Number(discount);
        
        const category = formData.get('category');
        if (category !== null) updateData.category = category as string;
        
        const size = formData.get('size');
        if (size !== null) updateData.size = size as string;
        
        const stock = formData.get('stock');
        if (stock !== null) updateData.stock = Number(stock);
        
        const description = formData.get('description');
        if (description !== null) updateData.description = description as string;

        // Handle dryfood boolean field
        if (formData.has('dryfood')) {
            updateData.dryfood = formData.get('dryfood') === 'true';
        }

        // Handle image upload
        const file = formData.get("image") as File;
        if (file && file.size > 0) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                return NextResponse.json({ error: 'File must be an image' }, { status: 400 });
            }

            // Validate file size (5MB limit)
            if (file.size > 5 * 1024 * 1024) {
                return NextResponse.json({ error: 'File size must be less than 5MB' }, { status: 400 });
            }

            // Delete old image if exists
            if (currentProduct.imagePublicId) {
                await deleteImageFromCloudinary(currentProduct.imagePublicId);
            }

            // Upload new image
            const uploadResult = await uploadImageToCloudinary(file, "products");
            updateData.image = uploadResult.secure_url;
            updateData.imagePublicId = uploadResult.public_id;
        }

        const product = await Product.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!product) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        return NextResponse.json(product, { status: 200 });

    } catch (error: unknown) {
        console.error('Error updating product:', error);
        return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {

    try {
        await connectDB();

        const { id } = await context.params;

        const product = await Product.findByIdAndDelete(id);

        if (!product) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        // Delete image from Cloudinary if it exists
        if (product.imagePublicId) {
            await deleteImageFromCloudinary(product.imagePublicId);
        }

        return NextResponse.json({ message: 'Product deleted successfully' }, { status: 200 });

    } catch (error: unknown) {
        console.error('Error deleting product:', error);
        return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
    }
}