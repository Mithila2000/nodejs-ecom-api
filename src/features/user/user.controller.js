import UserModel from "./user.model.js";
import jwt from 'jsonwebtoken';
import UserRepository from "./user.repository.js";
import bcrypt from 'bcrypt';

export default class UserController {
constructor(){
    this.userRepository = new UserRepository();
}

   async signUp(req, res, next) {
    const {
      name,
      email,
      password,
      type,
    } = req.body;
    try{
      
    // const hashedPassword = await bcrypt.hash(password, 12)
    const user = new UserModel(
      name,
      email,
      password,
      type
    );
    await this.userRepository.signUp(user);
    res.status(201).send(user);
  }catch(err){
    next(err);
  }
  }



    async signIn(req, res, next) {
        try {
            // 1. find user by email
            const user = await this.userRepository.findByEmail(req.body.email);
            console.log(req.body)
            console.log(user);
            if(!user) {
                res.status(400).send("Incorrect Credentials");
            } else {
                // 2. compare password with hashed password
                // const result = await bcrypt.compare(req.body.password, user.password);
                // if(result) {
                    // 3. Create token
                // sign method takes first argument as payload - what we want to store in payload to be accessed later maybe and second argument is secret or private key using which u r going to sign the token and same key has to be used when u r verifying the token
                const token = jwt.sign({userID: user._id, email: user.email}, 
                    process.env.JWT_SECRET,
                    {
                        expiresIn: '1h',    // options
                    })
                //4. Send token
                return res.status(200).send(token) // .cookie("jwtToken", token, {maxAge: 900000, httpOnly: false}) - using cookie
                // } else {
                //     res.status(400).send("Incorrect Credentials");
                // }
            }
        }
        catch (err) {
            console.log(err);
            return res.status(500).send("Something went wrong")
        }
    }

    async resetPassword(req, res, next) {
        const {newPassword} = req.body
        const userID = req.userID
        const hashedPassword = await bcrypt.hash(newPassword, 12)
        try {
            await this.userRepository.resetPassword(userID, hashedPassword)
            res.status(200).send("Password is reset")
        } catch(err) {
                console.log(err);
            return res.status(500).send("Something went wrong")
        }
    }
}