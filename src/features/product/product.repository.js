import { ObjectId } from "mongodb";
import { getDB } from "../../config/mongodb.js";
import { ApplicationError } from "../../error-handler/applicationError.js";
import mongoose, { mongo } from "mongoose";
import { productSchema } from "./product.schema.js";
import { reviewSchema } from "./review.schema.js";
import { categorySchema } from "./category.schema.js";

const ProductModel = mongoose.model('Product', productSchema)      // mongoose pluralizes the collection name
const ReviewModel = mongoose.model('Review', reviewSchema)
const CategoryModel = mongoose.model('Category', categorySchema)

class ProductRepository {
constructor() {
    this.collection = "products"
}

    async add(productData) {
        try {
            // without category
            // const db = getDB();
            // const collection = db.collection(this.collection);
            // await collection.insertOne(productData);
            // return productData;

            // with category
            // 1. add product
            
            productData.categories = productData.category.split(',').map(e => e.trim());
            console.log(productData)
            const newProduct = new ProductModel(productData);
            const savedProduct = await newProduct.save();

            // 2. update categories  - categories are ids of the categories here, if it is name, we will first have to find dids for the names and then add it in product model
        await CategoryModel.updateMany(
            {_id: {$in: productData.categories}} ,  // take multiple ids from the array
            {
                $push: {products: new ObjectId(savedProduct._id)}            // pushing product id to existing array
            }
        )
        } catch(err) {
            console.log(err);
                    throw new ApplicationError("Something went wrong", 500)
        }
    }

    async getAll() {
        try {
            const db = getDB();
            const collection = db.collection(this.collection);
            const products = await collection.find().toArray();
            console.log(products);
            return products;
        } catch(err) {
            console.log(err);
                    throw new ApplicationError("Something went wrong", 500)
        }
    }

    async get(id) {
        try {
            const db = getDB();
            const collection = db.collection(this.collection);
            return await collection.findOne({_id: new ObjectId(id)});
        } catch (err) {
            console.log(err);
            throw new ApplicationError("Something went wrong", 500)
        }
    }

    // async filter(minPrice, maxPrice, category) {
    //     try {
    //         const db = getDB();
    //         const collection = db.collection(this.collection);
    //         let filterExpression = {}
    //         if(minPrice) {
    //             filterExpression.price = {$gte: parseFloat(minPrice)}
    //         }
    //         if(maxPrice) {
    //             filterExpression.price = {...filterExpression.price, $lte: parseFloat(maxPrice)}
    //         }
    //         if(category) {
    //             filterExpression.category = category
    //         }

    //         return await collection.find(filterExpression).toArray();
    //     } catch (err) {
    //         console.log(err);
    //         throw new ApplicationError("Something went wrong", 500)
    //     }
    // }

    // async rate(userID, productID, rating) {
    //     try {
    //         const db = getDB();
    //         const collection = db.collection(this.collection);

    //         //1. Find the product
    //         const product = await collection.findOne({_id: new ObjectId(productID)})

    //         // 2. Find the rating
    //         const userRating = product?.ratings?.find(r => r.userID == userID)

    //         if(userRating) {
    //             //3. Update the ratiing 
    //             await collection.updateOne({
    //                 _id: new ObjectId(productID), "ratings.userID": new ObjectId(userID)
    //             }, {
    //                 $set: {
    //                     "ratings.$.rating": rating              // $ gives us the first rating found
    //                 }
    //             })
    //         } else {
    //             collection.updateOne({
    //                 _id: new ObjectId(productID)
    //             }, {
    //                 $push: {ratings:{userID: new ObjectId(userID), rating}}
    //             })
    //         }
            
    //     } catch (err) {
    //         console.log(err);
    //         throw new ApplicationError("Something went wrong", 500)
    //     }
    // }


    // using and and or operators
    // product should have minPrice specified and category
     
    async filter(minPrice, categories) {
        try {
            const db = getDB();
            const collection = db.collection(this.collection);
            let filterExpression = {}
            if(minPrice) {
                filterExpression.price = {$gte: parseFloat(minPrice)}
            }
            // the array in postman is considered as string so we need to convert that into array for $in operator
            // ['Cat1', 'Cat2']
            categories = JSON.parse(categories.replace(/'/g, '"')) 
            console.log(categories)
            if(categories) {
                filterExpression = {$or: [{category: {$in: categories}}, filterExpression]}
            }

            return await collection.find(filterExpression).project({name:1, price:1, _id: 0, ratings: {$slice: 1}}).toArray();   // 1 indicates inclusion and 0 exclusion 
            // $slice: 1 shows only first rating, -1 would show last rating, 2 would show first two
        } catch (err) {
            console.log(err);
            throw new ApplicationError("Something went wrong", 500)
        }
    }

    // approach to prevent the race condition (user trying to update the rating from two different devices at the same time)
    // async rate(userID, productID, rating) {
    //     try {
    //         const db = getDB();
    //         const collection = db.collection(this.collection);

    //         // push and pull are atomic operators(run simultaneousy), either both of them will execute or none of them

    //         // 1. Removes existing entry
    //         await collection.updateOne({
    //             _id: new ObjectId(productID)
    //         }, {
    //             $pull: {ratings: {userID: new ObjectId(userID)}}
    //         })
            
    //         // 2. add new entry
    //             collection.updateOne({
    //                 _id: new ObjectId(productID)
    //             }, {
    //                 $push: {ratings:{userID: new ObjectId(userID), rating}}
    //             })
            
    //     } catch (err) {
    //         console.log(err);
    //         throw new ApplicationError("Something went wrong", 500)
    //     }
    // }

//mongoose approach

async rate(userID, productID, rating) {
    try {
        // 1. Check if product exists
        const productToUpdate = await ProductModel.findById(productID);
        if(!productToUpdate) {
            throw new Error("Product Not Found")
        }

        // 2. Get the existing review
        const userReview = await ReviewModel.findOne({product: new ObjectId(productID), user: new ObjectId(userID)})
        if(userReview) {
            userReview.rating = rating;
            await userReview.save();
        } else {
            const newReview = new ReviewModel({
                product: new ObjectId(productID), 
                user: new ObjectId(userID),
                rating: rating
            })
            await newReview.save();
        }
    }   catch (err) {
            console.log(err);
            throw new ApplicationError("Something went wrong", 500)
        }
}

    async averageProductPricePerCategory() {
        try {
            const db = getDB();
            return await db.collection(this.collection)
            .aggregate([                            // aggregation pipeline is the array of stages
                { 
                    // Stage 1: Get average price per category
                    $group: {
                        _id: "$category",
                        averagePrice: {$avg: "$price"}
                    }
                }
            ]).toArray();
        } catch (err) {
            console.log(err);
            throw new ApplicationError("Something went wrong", 500)
        }
    }
}

export default ProductRepository