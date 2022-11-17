import express from "express";
import asyncHandler from "express-async-handler";
import Product from "./../Models/ProductModel.js";
import Category from "../Models/Category.js";
import { admin, protect } from "./../Middleware/AuthMiddleware.js";




const productRoute = express.Router();

// GET ALL PRODUCT
productRoute.get("/", asyncHandler(async (req, res) => {
  const pageSize = 6;
  const page = Number(req.query.pageNumber) || 1;
  const order = req.query.order || '';
  
  const stock =
    req.query.stock && Number(req.query.stock) !== 0
      ? Number(req.query.stock)
      : 0;
  const category = req.query.category ? { categories: req.query.category } : {};
  const stockFilter = stock ? { countInStock: { $gte: stock } } : {};
  const priceFilter = req.query.min && req.query.max ? { price: { $gte: req.query.min, $lte: req.query.max } } : {};
  const keyword = req.query.keyword
    ? {
      name: {
        $regex: req.query.keyword,
        $options: "i",
      },
    }
    : {};

  const sortOrder =
    order === 'lowest'
      ? { price: 1 }
      : order === 'highest'
        ? { price: -1 }
        : order === 'toprated'
          ? { rating: -1 }
          : { _id: -1 };
  const count = await Product.countDocuments({ ...keyword, ...priceFilter, ...stock, ...category, ...stockFilter});
  const products = await Product.find({ ...keyword, ...category, ...stock, ...priceFilter, ...stockFilter }).populate("categories")
    .limit(pageSize)
    .skip(pageSize * (page - 1))
    .sort(sortOrder);
  res.json({ products, page, pages: Math.ceil(count / pageSize) });
})
);

// ADMIN GET ALL PRODUCT WITHOUT SEARCH AND PEGINATION 
productRoute.get("/all", protect, admin, asyncHandler(async (req, res) => {
  const products = await Product.find({}).sort({ _id: -1 }).populate('categories');
  res.json(products);
})
);

// GET SINGLE PRODUCT
productRoute.get("/:id", asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).populate('categories');
  if (product) {
    res.json(product);

  } else {
    res.status(404);
    throw new Error("Product not Found");
  }
})
);

// PRODUCT REVIEW
productRoute.post("/:id/review", protect, asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const product = await Product.findById(req.params.id);

  if (product) {
    const alreadyReviewed = product.reviews.find(
      (r) => r.user.toString() === req.user._id.toString()
    );
    if (alreadyReviewed) {
      res.status(400);
      throw new Error("Product already Reviewed");
    }
    const review = {
      name: req.user.name,
      rating: Number(rating),
      comment,
      user: req.user._id,
    };

    product.reviews.push(review);
    product.numReviews = product.reviews.length;
    product.rating =
      product.reviews.reduce((acc, item) => item.rating + acc, 0) /
      product.reviews.length;

    await product.save();
    res.status(201).json({ message: "Reviewed Added" });
  } else {
    res.status(404);
    throw new Error("Product not Found");
  }
})
);

// DELETE PRODUCT
productRoute.delete("/:id", protect, admin, asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (product) {
    await product.remove();
    res.json({ message: "Product deleted" });
  } else {
    res.status(404);
    throw new Error("Product not Found");
  }
})
);


// CREATE PRODUCT 
productRoute.post("/", protect, admin, asyncHandler(async (req, res) => {
    const { name, price, description, categories, image, countInStock } = req.body;//categories= array de id's de categorias
    const productExist = await Product.findOne({ name });
    if (productExist) {
      res.status(400);
      throw new Error("Product name already exist");
    } else {
      const product = new Product({
        name,
        price,
        description,
        image,
        countInStock,
       // user: req.user._id,
      });
      if (product) {
        for(var i = 0; i < categories.length; i++){
          let adding = await Category.findOne({name: categories[i]})
          product.categories = [...product.categories, adding]
        }
        const createdproduct = await product.save();
        res.status(201).json(createdproduct);
      } else {
        res.status(400);
        throw new Error("Invalid product data");
      
      }
    }
  })
);


// UPDATE PRODUCT
productRoute.put("/:id", protect, admin, asyncHandler(async (req, res) => {
  const { name, price, description, image, countInStock, categories } = req.body;
  const product = await Product.findById(req.params.id);
  console.log(categories)
  //const categorias = await categories.map(e=> Category.findOne({e}))
  if (product) {
    product.name = name || product.name;
    product.price = price || product.price;
    product.description = description || product.description;
    product.image = image || product.image;
    product.countInStock = countInStock || product.countInStock;
    product.categories = categorias || product.categories;
    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } else {
    res.status(404);
    throw new Error("Product not found");
  }
})
);
export default productRoute;
