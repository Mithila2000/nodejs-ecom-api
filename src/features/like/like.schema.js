import mongoose, { mongo } from "mongoose";

export const likeSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    likeable: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'types'                        // attribute to specify a path that tells which collection the id refers to
    },
    types: {
        type: String,
        enum: ['Product', 'Category']
    }
}).pre('save', (next) => {
    console.log("New like coming in");
    next();
}).post('save', (doc) => {
    console.log("Like is saved");
    console.log(doc)
}).pre('find', (next) => {
    console.log('Retriving likes');
    next()                 // if next is not mentioned, find will never execute 
}).post('find', (doc) => {
    console.log("Find is completed")
    console.log(doc);
})