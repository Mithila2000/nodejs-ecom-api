// Manage routes/paths to product controller

// 1. Import express
import express from 'express';
import ProductController from './product.controller.js';
import {upload} from "../../middlewares/fileupload.middleware.js"

//2. Initialize express router
const productRouter = express.Router();

const productController = new ProductController();

// All the paths to controller methods
// localhost:3200/api/products - this is already specific in server, rest of the url pattern will come here

//localhost:4100/api/products/filer?minPrice=10&maxPrice=20&category=Category1   - query parameters
productRouter.post("/rate", (req, res, next) => productController.rateProduct(req, res, next))
productRouter.get("/filter", (req, res) => productController.filterProduct(req, res))
productRouter.get("/", (req, res) => productController.getAllProducts(req, res));
productRouter.post("/", upload.single('imageUrl'), (req, res) => {
    productController.addProduct(req, res)
})
productRouter.get("/averagePrice", (req, res, next) => productController.averagePrice(req, res))
productRouter.get("/:id", (req, res) => productController.getOneProduct(req, res))



export default productRouter;
