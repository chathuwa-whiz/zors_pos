import mongoose, { Schema, Document } from "mongoose";

export interface User extends Document {
    email: string;
    password: string;
    name: string;
    role: 'admin' | 'cashier';
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema = new Schema<User>({
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    name: { type: String, required: true },
    role: { type: String, enum: ['admin', 'cashier'], required: true },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

const UserModel = mongoose.model<User>('User', UserSchema);

export default UserModel;