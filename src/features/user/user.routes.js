// Manage routes/paths to product controller

// 1. Import express
import express from 'express';
import UserController from './user.controller.js';
import jwtAuth from '../../middlewares/jwt.middlware.js';

//2. Initialize express router
const userRouter = express.Router();

const userController = new UserController();

// All the paths to controller methods

userRouter.post("/signup", (req, res, next) => {
    userController.signUp(req, res, next);    // for the app to access this keyword we need to create instance/ call the function
})
userRouter.post("/signin", (req, res) => {
    userController.signIn(req, res);    // for the app to access this keyword we need to create instance/ call the function
})
userRouter.put("/resetPassword", jwtAuth, (req, res) => {
    userController.resetPassword(req, res)
})

export default userRouter;
