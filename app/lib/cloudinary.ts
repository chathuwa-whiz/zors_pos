import { v2 as cloudinary, ConfigOptions, UploadApiResponse } from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME!,
    api_key: process.env.CLOUD_API_KEY!,
    api_secret: process.env.CLOUD_API_SECRET!,
} as ConfigOptions);

export const cloudinaryConnection = async (): Promise<void> => {
    try {
        const result = await cloudinary.api.ping();
        console.log("Cloudinary connection successful: ", result.status);
    } catch (error: any) {
        console.error("Cloudinary connection failed:", error.message);
    }
};

// Upload image from file buffer
export const uploadImageToCloudinary = async (
    file: File,
    folder: string = "products"
): Promise<UploadApiResponse> => {
    try {
        // Convert file to base64
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const base64String = buffer.toString('base64');
        const dataURI = `data:${file.type};base64,${base64String}`;

        const result: UploadApiResponse = await cloudinary.uploader.upload(dataURI, {
            folder,
            resource_type: "image",
            transformation: [
                { width: 500, height: 500, crop: "fill" },
                { quality: "auto:good" }
            ]
        });

        return result;
    } catch (error: any) {
        console.error("Failed to upload image to Cloudinary:", error.message);
        throw new Error("Image upload failed");
    }
};

// Delete image from Cloudinary
export const deleteImageFromCloudinary = async (publicId: string): Promise<void> => {
    try {
        await cloudinary.uploader.destroy(publicId);
    } catch (error: any) {
        console.error("Failed to delete image from Cloudinary:", error.message);
    }
};

export default cloudinary;