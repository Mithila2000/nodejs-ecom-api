import { ObjectId } from "mongodb";
import { getDB } from "../../config/mongodb.js"
import { ApplicationError } from "../../error-handler/applicationError.js";

export default class CartItemsRepository {
    constructor() {
        this.collection = "cartItems"
    }

    async add(productID, userID, quantity) {
        // setting custom id
        try {
            const db = getDB();
        const collection = db.collection(this.collection)
        
        const id = await this.getNextCounter(db)
            console.log(id)
        //find the document
        // either insert or update
        await collection.updateOne(
            {productID: new ObjectId(productID), userID: new ObjectId(userID)},    //filter
             { $setOnInsert: {_id: id},                                           // only sets the id if new document is being insert and not on update, it won't do anything during update
                $inc: {                                                              // increment operator
                quantity: quantity
             }},
                {upsert: true})                                                    // upsert parameter
        } catch (err) {
                    console.log(err);
                    throw new ApplicationError("Something went wrong", 500)
                }

        // try {
        //     const db = getDB();
        // const collection = db.collection(this.collection)

        // //find the document
        // // either insert or update
        // await collection.updateOne(
        //     {productID: new ObjectId(productID), userID: new ObjectId(userID)},    //filter
        //      {$inc: {                                                              // increment operator
        //         quantity: quantity
        //      }},
        //         {upsert: true})                                                    // upsert parameter
        // } catch (err) {
        //             console.log(err);
        //             throw new ApplicationError("Something went wrong", 500)
        //         }
    }

    async get(userID) {
        try {
            const db = getDB();
        const collection = db.collection(this.collection)
        return await collection.find({userID: new ObjectId(userID)}).toArray()  // as find functioon returns cursor
        } catch (err) {
                    console.log(err);
                    throw new ApplicationError("Something went wrong", 500)
                }
    }

    async delete(userID, cartItemID) {
        try {
            const db = getDB();
        const collection = db.collection(this.collection)
        const result = await collection.deleteOne({_id: new ObjectId(cartItemID), userID: new ObjectId(userID)})
        return result.deletedCount>0
        } catch(err) {
            console.log(err);
                    throw new ApplicationError("Something went wrong", 500)
        }
    }

    async getNextCounter(db) {
        const resultDocument = await db.collection("counters").findOneAndUpdate(
            {_id: "cartItemId"},
            {$inc: {value: 1}},
            {returnDocument: 'after'}               // by default findoneandupdate func returns old document. by providing this option, it returns the new updated document     
        )

        console.log(resultDocument)

        return resultDocument?.value
    }
}