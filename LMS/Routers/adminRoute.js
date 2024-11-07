import { Router } from "express";
import bcrypt from 'bcrypt'
import jwt from "jsonwebtoken"
import { authenticate } from "../Middleware/auth.js";
import dotenv from "dotenv"
import mongoose from "mongoose";

dotenv.config()
const adminRoute = Router();
const secretkey = process.env.secretkey
mongoose.connect("mongodb://localhost:27017/LMS")
// Root route for admin
adminRoute.get('/', (req, res) => {
    res.status(200).json({ message: "Hi" });
    console.log("Hi");
});

// signup

const userSchema = mongoose.Schema({
    username:{type:String,unique:true},
    email:String,
    password:String,
    role:String
})

const user = mongoose.model("Userdetails",userSchema)

adminRoute.post("/signup",async (req,res)=>{
    try{
        const {Username,Email,Password,Role} = req.body;
        const newP = await bcrypt.hash(Password,10)
        const oldUser = await user.findOne({username:Username})
        // console.log(oldUser);
        
        if(oldUser){
            res.status(404).json({message:"Username already existed"})
        } else{
            const newUser = new user({
                username:Username,
                email:Email,
                password:newP,
                role:Role
            })
            newUser.save()
            console.log("Successfully registered",newUser);
            res.status(200).json({message:"Successfully registered"})
            
        }
    } catch(error){
        res.status(500).json({message:"Internal server error....."})
    }
})

// login

adminRoute.post('/login',async (req,res)=>{
    const {Username, Password} = req.body
    const result = await user.findOne({username:Username})

    const valid = await bcrypt.compare(Password,result.password)
    // console.log(valid);
    if(!result){
        res.status(404).json({message:"Invalid username or password"})
    } 
    if(!valid){
        res.status(404).json({message:"Invalid username or password"})
    }
    else{
        const token = jwt.sign({username:Username,role:result.role},secretkey,{expiresIn:'1h'})
        // console.log("token: ",token);
        res.cookie('authToken',token,{httpOnly:true})
        res.status(200).json({message:"Successfully logged"})

        
    }
    
})


// view user
adminRoute.get("/viewuser", authenticate, async (req,res)=>{
    console.log(req.role);

    
})

// add book

adminRoute.post("/addBook", authenticate, async (req,res)=>{
console.log(req.Role);

    
})



export { adminRoute }
