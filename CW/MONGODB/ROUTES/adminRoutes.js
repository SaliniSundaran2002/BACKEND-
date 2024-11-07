import { json, Router } from "express";
import bcrypt from 'bcrypt'
import jwt from "jsonwebtoken"
import { authenticate } from "../Middleware/auth.js";
import dotenv from "dotenv"
import mongoose from "mongoose"


dotenv.config();
const adminRoute = Router();
// const user = new Map();
const secretKey = process.env.secretKey;

// Define user schema
const userSchema = new mongoose.Schema(
    {
        FirstName: String,
        LastName: String,
        Username: { type: String, unique: true },
        Password: String,
        Role: String
    }
)
// Create model
const user = mongoose.model('Userdetails',userSchema);

mongoose.connect('mongodb://localhost:27017/KBA_Course')

adminRoute.get('/', (req, res) => {
    res.send("Hello World");
})

adminRoute.post('/signup', async (req, res) => {
    try {
        console.log("Hi");
        const data = req.body;
        // console.log(data.firstName);
        const { firstName,
            lastName,
            username,
            password,
            role } = data;
        console.log(firstName);
        const newP = await bcrypt.hash(password, 10)
        console.log(newP);
        const existingUser = await user.findOne({Username:username})

        if(existingUser){
            res.status(400).json({ message: "Already Registerd" })
        }
        else {
            // create a new user
            const newUser = new user({
                FirstName:firstName,
                LastName:lastName,
                Username:username,
                Password:newP,
                Role:role
            });

            // save user to MongoDB
            await newUser.save();
            res.status(201).json({message:"User Registered successfully!"})
            };
    } catch (error) {
        res.status(500).json({ message: "error occured!" })
    }

})

adminRoute.post('/login', async (req, res) => {
    const { username, password } = req.body
    // const result = user.get(username)
    const result = await  user.findOne({Username:username})
    console.log(result);
    const valid = await bcrypt.compare(password, result.Password)
    if (!result) {
        res.status(404).json({ message: "Invalid username and password" })
    }

    if (!valid) {
        res.status(404).json({ message: "Invalid username and password" })
    }
    else {


        // console.log(valid)
        const token = jwt.sign({ username: username, role: result.Role }, secretKey, { expiresIn: '24h' })
        console.log("tocken: ", token)
        res.cookie('authToken', token, { httpOnly: true })
        res.status(200).json({ message: "Successfully logged" })

    }

})

const couresSchema = new mongoose.Schema({
    Courseid:{type:String,unique:true},
    Coursename:String,
    Coursetype:String,
    Description:String,
    Price:String
})

//create a model
const course = new mongoose.model('CourseDetails',couresSchema)
// const course = new Map()
adminRoute.post('/addcourse', authenticate, async (req, res) => {
    console.log("Username : ", req.username);
    console.log("Userrole : ", req.role);
    const { courseId, courseName, courseType, description, price } = req.body

    try {

        // const course = new Map()
        if (req.role == 'admin') {
            
            const exCourse = await course.findOne({Courseid:courseId})
            if(exCourse){
                res.status(400).json({message: "Course already added!"})
            } else{
                // create new course
                const newCourse= new course({
                    Courseid:courseId,
                    Coursename:courseName,
                    Coursetype:courseType,
                    Description:description,
                    Price:parseInt(price)
                })
                // save course
                await newCourse.save()
            
            
            // console.log(details);
            console.log("Course Details : ", newCourse);

            // console.log();
            res.status(200).json({ message: "Course added successfully" })
            }
        } else {
            console.log("Only the admin can add a course.");
            res.status(400).json({ message: "Not success!" })


        }
    } catch (error) {
        console.log("Error")
    }

})

// using params
adminRoute.get('/getcourse/:id', authenticate, (req, res) => {
    console.log("Details: ", course)
    const searchTerm = req.params.id;
    const result = []
    if (searchTerm) {
        for (const [id, item] of course) {
            if (id == searchTerm || item.courseName.includes(searchTerm) || item.courseType.includes(searchTerm) || item.description.includes(searchTerm)) {
                result.push({ id, ...item })
                console.log("Result : ", result);
                res.status(200).json({ message: "Search term found" })

            } else {
                console.log("No search term found");
                res.status(400).json({ message: "" })

            }
        }

    }



})


// using query
adminRoute.get('/getcourse', (req, res) => {
    try {
        const search = req.query.courseName;
        console.log(search);
        const result = course.get(search)
        if (result) {

            res.send(result);
        }
        else {
            res.status(404).json({ message: "No course found,Check the name" })
        }
    }
    catch (error) {
        res.status(400).json({ message: "Check the input" })
    }
})



adminRoute.patch('/updateCourse', authenticate, async (req, res) => {
    const user = req.role;
    const { courseName, courseId, courseType, description, price } = req.body;

    try {
        // Check if user has admin privileges
        if (user === "admin") {
            // Find the course by CourseName and update its details
            const result = await course.updateOne(
                { Courseid: courseId },
                {
                    $set: {
                        Coursename: courseName,
                        Coursetype: courseType,
                        Description: description,
                        Price: parseInt(price)
                    }
                }
            );

            // Check if a course was found and updated
            if (result.matchedCount === 0) {
                return res.status(400).json({ message: "No such course" });
            }

            res.status(201).json({ message: "Course Details Updated" });
        } else {
            res.status(400).json({ message: "Unauthorized Access" });
        }
    } catch (error) {
        // Error handling for any unexpected issues
        res.status(400).json({ message: "Check the Course Details" });
    }
});



adminRoute.delete('/deletecourse/:id', authenticate, (req, res) => {
    try {
        const data = req.params.id
        console.log(data);
        const indata = parseInt(data)



        if (req.role == 'admin') {
            console.log(course);

            // const d1=course.get(data);
            // console.log(d1);

            if (course.has(indata)) {
                course.delete(indata)
                console.log("Successfully deleted");
                res.status(200).json({ message: "Deleted" })

            } else {
                console.log("id not found");
                res.status(200).json({ message: "not found" })
            }
        } else {
            console.log("Admin Only");

        }
    } catch (error) {
        res.send(error)
    }
})

adminRoute.delete('/logout', (req, res) => {
    res.clearCookie('authToken')
    res.status(200).json({ message: "Logged Out" })
    console.log("Logged Out");

})


adminRoute.get('/viewuser', authenticate, (req, res) => {
    try {
        const user = req.role;
        res.json({ user });
    }
    catch {
        res.status(404).json({ message: 'user not authorized' });
    }
})

adminRoute.get('/viewcourse', async (req, res) => {
    try {
        console.log(course.size);

        if (course.size != 0) {


            res.send(Array.from(course.entries()))
        }
        else {
            res.status(404).json({ message: 'Not Found' });
        }
    }
    catch {
        res.status(404).json({ message: "Internal error" })
    }
})


export { adminRoute };