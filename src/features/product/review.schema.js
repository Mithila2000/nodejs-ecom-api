import mongoose from "mongoose";

export const reviewSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'                            // s will be added automatically by mongoose to make plural (products)
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'                            // s will be added automatically by mongoose to make plural (users)
    },
    rating: Number
})