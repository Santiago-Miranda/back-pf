import express from 'express';
import asyncHandler from 'express-async-handler';
import Category from "../models/Category.js"
import Product from '../models/ProductModel.js';
import { protect, admin } from "../Middleware/AuthMiddleware.js";

const categoryRoute = express.Router();

//get all categories
categoryRoute.get("/", asyncHandler(async(req, res) => {
    const categories = await Category.find({})
    res.json(categories)
}))

//get all products of a category
categoryRoute.get('/items/:id', asyncHandler(async (req, res) => {
    const {id} = req.params
    const search = await Product.find({categories:`${id}`})
    res.json(search)
}))

//post categorie
categoryRoute.post('/', protect, admin, asyncHandler(async(req, res) => {
    const {name} = req.body;
    const category = new Category({
        name
    })
    if(category){
        const createdCategory = await category.save()
        res.status(201).json(createdCategory)
    } else {
        res.status(404);
        throw new Error("Invalid category data")
    }
}))

//usar ruta get para traer los productos, guardar en array, limpiar productos con un 
//for y despues eliminar la categoria
categoryRoute.delete("/", asyncHandler(async(req, res) => {
    const {id} = req.body
    const deletedOne = await Category.findById(id)
    const search = await Product.find({categories:`${id}`})
    if(deletedOne){
    for(var i = 0; i<search.length; i++){
        if(search[i].categories.includes(deletedOne._id)){
            search[i].categories = search[i].categories.filter(_id => id != deletedOne.id)
            search[i].save()
            console.log(search[i])
        }
    }
    deletedOne.remove()
    res.status(200).send('Categorie deleted succesfully')
    } else {res.status(404).send("an error has occurred, please try again")}
}))

export default categoryRoute