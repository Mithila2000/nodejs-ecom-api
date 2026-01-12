import mongoose from "mongoose";
import { Schema } from "mongoose";

export const cartSchema = new Schema({
    productID: {type: mongoose.Schema.Types.ObjectId, ref: 'Product'},
    userId: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    quantity: Number
})