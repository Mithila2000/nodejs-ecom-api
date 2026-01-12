import { ObjectId } from "mongodb";
import { getClient, getDB } from "../../config/mongodb.js"
import OrderModel from "./order.model.js";
import { ApplicationError } from "../../error-handler/applicationError.js";

export default class OrderRepository {
     constructor() {
        this.collection = "orders"
     }

     async placeOrder(userId) {
       const client = getClient()
       const session = client.startSession()
      try {
         const db = getDB()
      
      session.startTransaction()         // collection of datatbase operations such that none of them are executed or all of them are executed
// 1. Get cart items and calculate total amount
        const items = await this.getTotalAmount(userId, session);
         const finalTotalAmount = items.reduce((acc, item) => acc+item.totalAmount, 0)  // 0 is the initial value of accumulator acc
      console.log(finalTotalAmount)

        // 2. Create order record
         const newOrder = new OrderModel(new ObjectId(userId), finalTotalAmount, new Date());
         await db.collection(this.collection).insertOne(newOrder, {session})

        // 3. Reduce the stock
         for(let item of items) {
            await db.collection("products").updateOne(
               { _id: item.productID},
               {$inc: {stock: -item.quantity}}, {session}
            )
         }

         // throw new Error("Something went wrong in place order")
        // 4. Clear the cart items
        await db.collection("cartItems").deleteMany({
         userID: new ObjectId(userId)
        },  {session})
        session.commitTransaction()   // updates the database indicating all the transactions in the database have been completed
      //   session.endSession()
        return
      } catch (err) {
                              if (session.inTransaction()) {
                await session.abortTransaction();
                console.log("Transaction aborted due to error.");
            }
                  session.endSession()
                  console.log(err);
                  throw new ApplicationError("Something went wrong", 500)
              }
              finally {
            // Always end the session, regardless of whether the transaction committed or aborted
            if (session) {
                session.endSession();
                console.log("Session ended.");
            }
        }
          }

     async getTotalAmount(userId, session) {
      const db = getDB();

      // this will give us cartItems with added field totalamount
      const items = await db.collection("cartItems").aggregate([
         // 1. Get cartitems of the user
         {
            $match: {userID: new ObjectId(userId)}
         },
         // 2. Get the products from product collection based on the ids in cart items collection
         {
            $lookup: {
               from: "products",
               localField: "productID",
               foreignField: "_id",
               as: "productInfo"
            }
         },
         // 3. Unwind the product info as above we got nested array of products
         {
            $unwind: "$productInfo"
         },
         // 4. Calculate total amount for each cartItems
         {
            $addFields: {                          // we are adding a field in cart items document 
               "totalAmount": { 
                  $multiply: ["$productInfo.price", "$quantity"]
               }
            }
         }
      ], {session}).toArray();
      return items
      
     }
}