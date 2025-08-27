import { deleteImageFromCloudinary, uploadImageToCloudinary } from "@/app/lib/cloudinary";
import connectDB from "@/app/lib/mongodb";
import Product from "@/app/models/Product";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, context: { params: { id: string } }) {

    try {
        await connectDB();

        const { id } = await context.params;

        const product = await Product.findById(id);

        if (!product) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        return NextResponse.json(product, { status: 200 });

    } catch (error) {
        console.error('Error fetching product:', error);
        return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
    }
}

export async function PUT(req: NextRequest, context: { params: { id: string } }) {
    try {
        await connectDB();

        const { id } = await context.params;
        const formData = await req.formData();

        // get the current product to check if image is uploaded
        const currentProduct = await Product.findById(id);

        if (!currentProduct) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        // Extract product data from FormData
        const updateData: any = {};
        
        // Only update fields that are present in formData
        const fields = ['id', 'name', 'costPrice', 'sellingPrice', 'discount', 'category', 'size', 'stock', 'description'];
        
        fields.forEach(field => {
            const value = formData.get(field);
            if (value !== null) {
                switch (field) {
                    case 'costPrice':
                    case 'sellingPrice':
                    case 'discount':
                    case 'stock':
                        updateData[field] = Number(value);
                        break;
                    default:
                        updateData[field] = value;
                }
            }
        });

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

    } catch (error) {
        console.error('Error updating product:', error);
        return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, context: { params: { id: string } }) {

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

    } catch (error) {
        console.error('Error deleting product:', error);
        return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
    }
}