import mongoose from "mongoose";
import { Schema } from "mongoose";

export const productSchema = new Schema({
    name: String,
    price: Number,
    category: String,
    description: String,
    inStock: Number,
    reviews: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Review"
        }
    ],
    category: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category"
        }
    ]
})