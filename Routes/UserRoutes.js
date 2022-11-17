import express from "express";
import asyncHandler from "express-async-handler";
import {sendConfirmationEmail, sendBanEmail, sendUnbanEmail, PaswordTokenEmail} from "../config/nodemailer.js";
import { protect, admin } from "../Middleware/AuthMiddleware.js";
import generateToken from "../utils/generateToken.js";
import User from "./../Models/UserModel.js";

const userRouter = express.Router();

// LOGIN
userRouter.post("/login", asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });


    if (user && user.status === "Pending"){
      res.status(401)
      throw new Error("Please confirm your email.")
    } else if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        token: generateToken(user._id),
        createdAt: user.createdAt,
      });
    } else{
      res.status(401);
      throw new Error("Invalid Email or Password");
    }
  })
);


// REGISTER
userRouter.post("/", asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });
    const characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let token = '';
    for (let i = 0; i < 25; i++) {
        token += characters[Math.floor(Math.random() * characters.length )];
    }
    console.log(token)
    if (userExists) {
      res.status(400);
      throw new Error("User already exists");
    }

    const user = await User.create({
      name,
      email,
      password,
      confirmationCode: token
    });
    

    if (user) {
      sendConfirmationEmail(user.name, user.email, user.confirmationCode)
      res.status(201).json({
        _id: user._id,
        name: user.name,
        image: user.image,
        email: user.email,
        isAdmin: user.isAdmin,
        isBaned: user.isBaned,
        token: generateToken(user._id),
      });
    } else {
      res.status(400);
      throw new Error("Invalid User Data");
    }
  })
);

// PROFILE
userRouter.get("/profile", protect, asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        createdAt: user.createdAt,
      });
    } else {
      res.status(404);
      throw new Error("User not found");
    }
  })
);

// UPDATE PROFILE
userRouter.put("/profile", protect, asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.image = req.body.image || user.image;
      if (req.body.password) {
        user.password = req.body.password;
      }
      const updatedUser = await user.save();
      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        image: updatedUser.image,
        isAdmin: updatedUser.isAdmin,
        createdAt: updatedUser.createdAt,
        token: generateToken(updatedUser._id),
      });
    } else {
      res.status(404);
      throw new Error("User not found");
    }
  })
);

// CONFIRMATE EMAIL
userRouter.put("/authMail", asyncHandler(async(req, res) => {
  const {email, confirmationCode} = req.body
  const userExists = await await User.findOne({email: email })

  if(userExists.status === "Pending" && userExists.confirmationCode === confirmationCode){
    userExists.status = "Active"
    userExists.save()
    res.status(200).send("Email verified succesfully")
  } else {
    res.status(404);
    throw new Error("Wrong user or token.")
  }
}))

//BORRADO LOGICO 
userRouter.put("/ban", protect, admin, asyncHandler(async(req, res) => {
    const { email } = req.body;
    const user = await User.findOne({email: email})
    
    if(user && !user.isAdmin){
      if(user && !user.isBaned) {
        user.isBaned = true
        sendBanEmail(user.name, user.email)
        user.save()
        res.status(200).send("User banned.")
      } else if (user && user.isBaned){
        user.isBaned = false
        sendUnbanEmail(user.name, user.email)
        user.save()
        res.status(200).send("User unbanned.")
      } 
    } else if (user && user.isAdmin){
      res.status(400).send("You cant ban an admin")
    } else {
      res.status(404);
      throw new Error('User not found')}
}))

//FORGOT PASSWORD EMAIL
userRouter.put('/PassCode', asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({email: email})
  const numbers = "1234567890"
  let token=""

  if(user){
    for(var i = 0; i < 6; i++) {
      token += numbers[Math.floor(Math.random() * numbers.length )];
    }
    user.confirmationCode = token;
    user.save()
    PaswordTokenEmail(user.name, user.email, token)
    res.status(200).send("Email sent correctly. check your email to reset your password.")
  } else {
    res.status(404).send("User not found.")
  }

}
));


//RESET PASSWORD
userRouter.put("/resetPass", asyncHandler(async(req, res) => {
  const {email, token, password} = req.body
  const user = await User.findOne({email: email})

  if(user && user.confirmationCode === token){
    user.password = password
    user.save()
    res.status(200).send("Password changed succesfully")
  } else if (user && user.confirmationCode !== token) {
    res.status(200).send("Wrong code, try again or ask for a new one.")
  } else {res.status(404).send("user not found")}
}));

//CHANGE ADMIN STATUS  
userRouter.put("/changeAdmin", protect, admin, asyncHandler(async(req, res) => {
  const {email} = req.body;
  const user = await User.findOne({email: email})
  if(user && user.isOwner == false){
    user.isAdmin = !user.isAdmin
    user.save()
    res.status(200).send("User status changed succesfully")
  } else if(user && user.isOwner == true){
    res.status(400).send("You can't change the status of this user.")
  }
  else {
    res.status(404).send("User not found.")
  }
}))


// GET ALL USER ADMIN
userRouter.get("/", protect, admin, asyncHandler(async (req, res) => {
    const users = await User.find({});
    res.json(users);
  })
);




export default userRouter;
