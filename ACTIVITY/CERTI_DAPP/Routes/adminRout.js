import { json, Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"
import { authenticate } from "../Middleware/auth.js";
import dotenv from "dotenv"
dotenv.config()

const adminRoute = Router()
const secretKey = process.env.secretKey;

adminRoute.get('/', (req, res) => {
    res.status(200).json({ message: "success" })
    console.log('ok');

})


const user = new Map()
adminRoute.post('/signup', async (req, res) => {
    try {
        const info = req.body
        const { firstname, lastname, role, username, password } = info
        console.log(info)
        if (user.has(username)) {
            console.log("Username already exists : ", username);
            res.status(400).json({ message: "Username already taken" })



        } else {
            const newPassword = await bcrypt.hash(password, 10)
            user.set(username, { firstname, lastname, role, newPassword })
            console.log("User added successfully : ", username);
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
        const result = user.get(username)
        const valid = await bcrypt.compare(password, result.newPassword)
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
            const token = jwt.sign({ username: username, role: result.role }, secretKey, { expiresIn: '1h' })
            res.cookie('authToken', token, { httpOnly: true })
            console.log("successfully logged in")
            res.status(200).json({ message: "Successfully logged in" })

        }
    } catch (error) {
        console.log("Error")
    }
})


const certificate = new Map()

adminRoute.post('/issuecertificate', authenticate, (req, res) => {
    try {
        // console.log(req.role);

        if (req.role == 'admin') {
            const { selectedCourse, certiId, candidateName, selectGrade, issueDate } = req.body

            certificate.set(certiId, { selectedCourse, candidateName, selectGrade, issueDate })
            console.log("IssueCertificate : ", certificate);
            res.status(200).json({ message: "Certificate issued!" })


        } else {
            res.status(400).json({ message: "You are not an admin!" })

        }
    } catch (error) {
        res.status(400).json({ message: "Error" })
    }

})


// adminRoute.get('/getcourse/:id', authenticate, (req, res) => {
//     const searchTerm = req.params.id
//     const result = []
//     try {
//         if (searchTerm) {
//             for (const [id, item] of certificate) {
//                 if (id == searchTerm || item.selectedCourse.includes(searchTerm) || item.candidateName.includes(searchTerm) || item.selectGrade.includes(searchTerm) || item.issueDate.includes(searchTerm)) {
//                     result.push({ id, ...item })
//                     console.log("Certificate Detailes : ", result);
//                     res.status(200).json({ message: "Search term found" })

//                 } else {
//                     console.log("No search term found");
//                     res.status(400).json({ message: "No search term found" })
//                 }
//             }
//         }

//     } catch (error) {
//         res.status(400).json({ message: "Error" })
//     }

// })




adminRoute.get('/getcourse/:id', (req, res) => {
    try {
        const search = req.params.id;
        console.log(search);
        // const result = course.get(search)
        if (certificate.has(search)) {
            // const result = certificate.get(search)
            const item = certificate.get(search)
            return res.status(200).json({
                message:search,
                certi:item
            })
            // res.send(result);
        }
        else {
            res.status(404).json({ message: "No course found,Check the id" })
        }
    }
    catch (error) {
        res.status(400).json({ message: "Check the input" })
    }
})


adminRoute.get('/viewuser', authenticate, async (req, res) => {
    // console.log("hi",req.role);

    try {
        const user = req.role
        res.status(200).json({ user })
    } catch (error) {
        console.log(error);

    }
})


// adminRoute.delete('/logout',(req,res)=>{

//     res.status(200).json({message : "Logout"})
//     console.log("Successfully logout!");

// })
export { adminRoute }