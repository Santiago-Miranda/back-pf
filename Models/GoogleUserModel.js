import mongoose from "mongoose";


const GoogleUserSchema =  mongoose.Schema({
    name:{type:String},
    email: {type: String},
    image:{type:String},
})
  
  
  const GoogleUser = mongoose.model('GoogleUser', GoogleUserSchema)

  export default GoogleUser