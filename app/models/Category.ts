import mongoose, { Schema } from "mongoose";

const CategorySchema = new Schema({
  name: { type: String, required: true },
  sub: { type: String },
});

export default mongoose.models.Category ||
  mongoose.model("Category", CategorySchema);