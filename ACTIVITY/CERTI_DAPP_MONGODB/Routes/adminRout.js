import { json, Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"
import { authenticate } from "../Middleware/auth.js";
import dotenv from "dotenv"
import mongoose from "mongoose";
dotenv.config()

const adminRoute = Router()
const secretKey = process.env.secretKey;

adminRoute.get('/', (req, res) => {
    res.status(200).json({ message: "success" })
    console.log('ok');

})
mongoose.connect('mongodb://localhost:27017/CENTRI_DAPP')
// create a schema

const userSchema = mongoose.Schema({
    Firstname:String,
    Lastname:String,
    Role:String,
    Username:{type:String,unique:true},
    Password:String
})
// const user = new Map()
const user = mongoose.model("userdetails ",userSchema)
adminRoute.post('/signup', async (req, res) => {
    try {
        const info = req.body
        const { firstname, lastname, role, username, password } = info
        // console.log(info)
        const exUser = await user.findOne({Username:username})

        if (exUser) {
            console.log("Username already exists : ", username);
            res.status(400).json({ message: "Username already taken" })



        } else {
            const newPassword = await bcrypt.hash(password, 10)
            console.log(newPassword);
            
            // user.set(username, { firstname, lastname, role, newPassword })
            const newUser = new user({
                Firstname:firstname,
                Lastname:lastname,
                Role:role,
                Username:username,
                Password:newPassword
            })

            newUser.save()
            console.log("User added successfully : ", username ,"\nUser Details: ",newUser);
            res.status(200).json({ message: "Signup successfull" })
            // console.log(newPassword);

        }
    } catch (error) {
        console.log("error........")

    }
})


adminRoute.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body
        // const result = user.get(username)
        const result = await user.findOne({Username:username})
        const valid = await bcrypt.compare(password, result.Password)
        if (!result) {
            // console.log("Valid User")
            console.log("Invalid User");
            res.status(400).json({ message: "Invalid username or password" })

        }

        if (!valid) {
            console.log("Invalid User");
            res.status(400).json({ message: "Invalid username or password" })
        }
        else {
            const token = jwt.sign({ username: username, role: result.Role }, secretKey, { expiresIn: '24h' })
            res.cookie('authToken', token, { httpOnly: true })
            console.log("successfully logged in")
            res.status(200).json({ message: "Successfully logged in" })

        }
    } catch (error) {
        console.log("Error")
    }
})



const certificateSchema = mongoose.Schema({
    Certiid:{type: String,unique:true},
    Candidatename:String,
    Selectedcourse:String,
    Grade:String,
    Issuedate:Date
})
// const certificate = new Map()
const certificate = mongoose.model("Addcertificate ",certificateSchema)

adminRoute.post('/issuecertificate',authenticate, (req, res) => {
    try{
        // console.log(req.role);
        
    if(req.role == 'admin'){
        const {selectedCourse,certiId,candidateName,selectGrade,issueDate} = req.body

        const newCerti = new certificate({
            Certiid:certiId,
            Candidatename:candidateName,
            Selectedcourse:selectedCourse,
            Grade:selectGrade,
            Issuedate:issueDate
        })

            // certificate.set(certiId,{selectedCourse,candidateName,selectGrade,issueDate})

            newCerti.save();
        console.log("IssueCertificate : ",newCerti);
        res.status(200).json({message : "Certificate issued!"})
        
        
    } else{
        res.status(400).json({message : "You are not an admin!"})
        
    }
}catch(error){
    res.status(400).json({message : "Error"})
}
    
})

adminRoute.get('/getcourse/:id', async (req, res) => {
    try {
        const search = req.params.id;
        console.log("Search ID:", search);

        const data = await certificate.findOne({Certiid:search})
        if(data){
            console.log(data);
            return res.status(200).json({data})
            
        } 

        return res.status(404).json({message:"Not found"})
        
    } catch (error) {
        return res.status(500).json({ message: "Check the input", error: error.message });
    }
});



// get all certificates

adminRoute.get('/ViewCertificates', async (req,res)=>{
    try{
        const allCertificates = await certificate.find()
        if(allCertificates){
            return res.status(200).json({allCertificates})
        } 
        return res.status(404).json({message:"Certificates not available"})
    } catch(error){
        return res.status(500).json({error})
    }
})





// adminRoute.get('/getcourse',(req,res)=>{
//     try{
//    const search= req.query.certiId; 
//    console.log(search);
   
//    console.log(search);
//         const result = course.get(search)
//         if (result) {

//             res.send(result);
//         }
//         else {
//             res.status(404).json({ message: "No course found,Check the name" })
//         }
//     }
//     catch (error) {
//         res.status(400).json({ message: "Check the input" })
//     }
//  })



 adminRoute.get('/viewuser',authenticate,async (req,res)=>{
    // console.log("hi",req.role);
    
    try{
        const user = req.role
        res.status(200).json({user})
    } catch(error){
        console.log(error);
        
    }
 })


// adminRoute.delete('/logout',(req,res)=>{
    
//     res.status(200).json({message : "Logout"})
//     console.log("Successfully logout!");
    
// })
export { adminRoute }