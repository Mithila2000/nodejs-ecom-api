import ProductModel from "./product.model.js";
import ProductRepository from "./product.repository.js";

export default class ProductController {
constructor() {
    this.productRepository = new ProductRepository();
}

    async getAllProducts(req, res) {
        try {
            const products = await this.productRepository.getAll();
        res.status(200).send(products);
        } catch(err) {
            console.log(err);
            return res.status(500).send("Something went wrong")
        }
        
    }

    async addProduct(req, res) {
        try {
            const {name, price, sizes, categories, description} = req.body;
        // const newProduct = new ProductModel(name, parseFloat(price), sizes.split(','), req.file.filename)
        // const createdRecord = await this.productRepository.add(newProduct);
        // res.status(201).send(createdRecord);

        const newProduct = new ProductModel(name, description, parseFloat(price), req?.file?.filename, categories, 
        sizes?.split(','))
        const createdProduct = await this.productRepository.add(newProduct);
        res.status(201).send(createdProduct);
        } catch(err) {
            console.log(err);
            return res.status(500).send("Something went wrong")
        }
    }

    async rateProduct(req, res, next) {
        // this is one of the method to handle error by wrapping entire controller method in try block
        try{
        const userID = req.userID;
        const productID = req.body.productID;
        const rating = req.body.rating;
            await this.productRepository.rate(userID, productID, rating);
            return res.status(200).send("Rating has been added")
        } catch(err) {
            console.log("Passing error to error middleware")
            next(err)
        }
    }

    async getOneProduct(req, res) {
        try {
            const id = req.params.id;            // to access root parameters
            const product = await this.productRepository.get(id);
         if(!product) {
            res.status(404).send("Product not found");
        } else {
            res.status(200).send(product);
        }
        } catch(err) {
            console.log(err);
            return res.status(500).send("Something went wrong")
        }
       
    }

    async filterProduct(req, res) {
        try {
            const minPrice = req.query.minPrice;
        const categories = req.query.category;
        console.log(categories)
         const result = await this.productRepository.filter(minPrice, categories);
        res.status(200).send(result);
    }
        catch(err) {
            console.log(err);
            return res.status(500).send("Something went wrong")
        }
    }

    async averagePrice(req, res, next) {
        try {
            const result = await this.productRepository.averageProductPricePerCategory();
            return res.status(200).send(result)
        } catch(err) {
            console.log(err);
            return res.status(500).send("Something went wrong")
        }
    }
    }