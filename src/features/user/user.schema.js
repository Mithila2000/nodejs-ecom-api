import mongoose from "mongoose";
import { Schema } from "mongoose";

export const userSchema = new Schema({
    name: { type: String, maxLength:[25, "Name can't be greater than 25 characters"]},
    email: {type: String, unique: true, required: true,
        match: [/.+\@.+\../, "Please enter a valid email"]
    },   // validations are also allowed
    password: {
        type:String,
        // validate: {             // custom validator
        //     validator: function(value) {     // value here will be password
        //         return /^(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,12}$/.test(value)   // test is the method in regex
        //     },
        //     message: "Password should be from 8 to 12 characters and should have a special character"
        // }
    },
    type: {type: String, enum: ['customer', 'seller']}
})