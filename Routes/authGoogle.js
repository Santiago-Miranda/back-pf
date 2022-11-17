import express from "express";
import GoogleUser from "../Models/GoogleUserModel.js";
import generateToken from "../utils/generateToken.js";



const googleRouter = express.Router();

googleRouter.post("/loginGoogle", async(req, res) => {
	const { email, name } = req.body
    const findUser = await GoogleUser.findOne({ email })
	try {
        if (!findUser) {
            const newUser = {
                name: name,
                email: email,
               
            
            }
            const addUser = await GoogleUser.create(newUser)
            const token = generateToken({id: addUser._id}, { expiresIn: 86400 })
            const userId = addUser._id
            const userMail = addUser.email
            const userName = addUser.name
           
          return  res.status(200).send({ token, userId,  userMail, userName })

        } else {

            const token = generateToken({id: findUser._id},{ expiresIn: 86400 })
            const userId = findUser._id       
            const userMail = findUser.email
            const userName = findUser.name
           
           return  res.status(201).send({ token, userId, userMail, userName })

        }
    } catch (error) {
        console.log(error)
        return res.status(404).send({ error })
    }
}
) 

export default googleRouter


	

