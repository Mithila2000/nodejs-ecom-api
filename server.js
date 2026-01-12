import './env.js'

// 1. Import Express
import express from "express";
import swagger from 'swagger-ui-express';
import bodyParser from 'body-parser';
import cors from 'cors'

import productRouter from "./src/features/product/products.routes.js";
import userRouter from "./src/features/user/user.routes.js"
import basicAuthorizer from "./src/middlewares/basicAuth.middleware.js";
import jwtAuth from "./src/middlewares/jwt.middlware.js";
// import cookieParser from "cookie-parser"; - using cookie
import cartRouter from "./src/features/cartItems/cartItems.routes.js";
import fs from 'fs';
import loggerMiddleware from "./src/middlewares/logger.middleware.js";
import { ApplicationError } from "./src/error-handler/applicationError.js";
import { connectToMongoDB } from "./src/config/mongodb.js";
import orderRouter from './src/features/order/order.routes.js';
import { connectUsingMongoose } from './src/config/mongooseConfig.js';
import mongoose from 'mongoose';
import likeRouter from './src/features/like/like.router.js';
const apiDocs = JSON.parse(fs.readFileSync('./swagger.json', 'utf-8'));

// 2. Create server
const server = express();



var corsOptions = {
    origin: "http://localhost:5500"
}

//CORS Policy configuration
server.use(cors(corsOptions));

// server.use((req, res, next) => {
//     res.header('Access-Control-Allow-Origin', '*') // * mean allow access to all clients otherwise specify the client. for ex. "http://localhost:5500"
//     res.header('Access-Control-Allow-Headers', '*');
//     res.header('Access-Control-Allow-Method', '*'); // not necessary to specify

//     // return ok for preflight request - A preflight request is an HTTP request that a browser sends to a server before making a potentially risky request. 
//     if(req.method == 'OPTIONS') {
//         return res.sendStatus(200);
//     }
//     next();
// })

server.use(bodyParser.json()); //express.json can also be used
// app.use(cookieParser()); - using cookie

server.use("/api-docs", swagger.serve, swagger.setup(apiDocs));   // SWAGGER.SERVE is a handler to create the documentation UI

server.use(loggerMiddleware);

server.use("/api/orders", jwtAuth, orderRouter)

// for all requests related to product, redirect to product routes
// localhost:3200/api/products - it is good practice to use "api" in path
server.use("/api/products", jwtAuth, productRouter)
server.use("/api/users", userRouter)
server.use("/api/cartItems", jwtAuth, cartRouter)
server.use("/api/likes", jwtAuth, likeRouter);

// 3. Default request handler
server.get("/", (req, res) => {
    res.send("Welcome to Ecommerce APIs")
})

// Error handler middleware - it should always be the last middleware
server.use((err, req, res, next) => {
    console.log(err);
    if(err instanceof mongoose.Error.ValidationError) {
        return res.status(400).send(err.message)
    }
    if(err instanceof ApplicationError) {
        return res.status(err.code).send(err.message)
    } 
    res.status(500).send("Something went wrong, please try later")  // 500 - server error, 503 - server down
})

//4. Middleware to handle 404 requests
server.use((req, res) => {
    res.status(404).send("API not found. Please check our documentation for more information at localhost:3200/api-docs");
})

//5. Specify post
server.listen(3200, () => {
    console.log('Server is running at 3200');
    // connectToMongoDB();
    connectUsingMongoose();
});

