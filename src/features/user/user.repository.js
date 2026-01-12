// MONGOOSE REPOSITORY

import mongoose from "mongoose";
import { userSchema } from "./user.schema.js";
import { ApplicationError } from "../../error-handler/applicationError.js";

// creating model from schema
const UserModel = mongoose.model("User", userSchema)

export default class userRepository {
// async signUp(user) {
//     try {
//          // create instance of model 
//     const newUser = new UserModel(user)    // This is a constructor using which you get instance of a model which is basically adocument
//     await newUser.save()
//     } catch(err) {
//          console.log(err);
//                 throw new ApplicationError("Something went wrong", 500)
//     }
   
// }

async signUp(user){
        try{
            // create instance of model.
            const newUser = new UserModel(user);
            await newUser.save();
            return newUser;
        }
        catch(err){
            console.log(err);
            if(err instanceof mongoose.Error.ValidationError){
                throw err;
            }else{
                console.log(err);
                throw new ApplicationError("Something went wrong with database", 500);
            }
            
        }
    }

async signIn(email, password) {
    try {
         return await UserModel.findOne({email, password})
    } catch(err) {
         console.log(err);
                throw new ApplicationError("Something went wrong", 500)
    }
   
}

async findByEmail(email) {
    try{
    return await UserModel.findOne({email})
    } catch(err) {
        console.log(err);
        throw new ApplicationError("Something went wrong", 500)
    }
  }

  async resetPassword(userID, newPassword) {
    try {
        let user = await UserModel.findById(userID)
        if(user) {
            user.password = newPassword;
            await user.save()   // here is updates the data as user is already present otherwise it would have created a new user
        } else {
            throw new Error("User not found")
        }
    } 
   catch(err) {
        console.log(err);
        throw new ApplicationError("Something went wrong", 500)
    }
}
}