import Router from "express";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import mongoose from "mongoose";
import dotenv from "dotenv"
import { authenticate } from "../Middleware/auth.js";
import multer from 'multer'
import path from 'path'




dotenv.config()



const adminRoute = Router()
const secretKey = process.env.secretKey
mongoose.connect('mongodb://localhost:27017/LMS1')



const userSchema = mongoose.Schema({
    Fullname: String,
    Email: String,
    Username: String,
    Password: String,
    Role: String
})

const userModel = mongoose.model("userdetails", userSchema)
adminRoute.post('/signup', async (req, res) => {
    try {
        const { fullname, email, username, password, role } = req.body;
        const exUsername = await userModel.findOne({ Username: username })
        const newP = await bcrypt.hash(password, 10)
        if (exUsername) {
            return res.status(400).json({ message: "Username already exist" })
        }
        const user = new userModel({
            Fullname: fullname,
            Email: email,
            Username: username,
            Password: newP,
            Role: role
        })
        user.save()
        console.log("successfully registered", user);
        return res.status(200).json({ message: "Successfully registered" })


    } catch (err) {
        return res.status(500).json({ message: "Internal server error....." })
    }
})

// login

adminRoute.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body
        const result = await userModel.findOne({ Username: username })

        if (!result) {
            // console.log("Valid User")
            console.log("Invalid User");
            res.status(400).json({ message: "Invalid username or password" })

        }
        const valid = await bcrypt.compare(password, result.Password)
        if (!valid) {
            console.log("Invalid User");
            res.status(400).json({ message: "Invalid username or password" })
        }
        else {
            const token = jwt.sign({ username: username, role: result.Role }, secretKey, { expiresIn: '12h' })
            res.cookie('authToken', token, { httpOnly: true })

            console.log("successfully logged in");
            res.status(200).json({ message: "Successfully logged in" })
        }


    } catch (err) {
        return res.status(500).json({ message: "Internal server error....." })
    }
})

// addbook

const bookSchema = mongoose.Schema({
    Bookname: { type: String, unique: true },
    AuthorName: String,
    BookType: String,
    Price: Number  // Ensuring price is stored as a number
});

const bookModel = mongoose.model("bookdetails", bookSchema);


adminRoute.post("/addBook", authenticate, async (req, res) => {
    try {

        const userRole = req.role

        // Check if the authenticated user's role is 'admin'
        if (req.role !== 'admin') {
            return res.status(403).json({ message: "Unauthorized: Only admin can add books" });
        }

        const {  bookname, authorname, booktype, price } = req.body;

        // Check if the book already exists in the database
        const existingBook = await bookModel.findOne({ Bookname: bookname });
        if (existingBook) {
            // console.log("Already added");
            return res.status(400).json({ message: `The book '${bookname}' is already added` });
        }

        // Create and save the new book
        const book = new bookModel({
            Bookname: bookname,
            AuthorName: authorname,
            BookType: booktype,
            Price: parseFloat(price)  // Ensure price is stored as a number
        });

        await book.save();
        console.log(`Successfully added book: ${book}`);
        return res.status(200).json({ message: `Successfully added book: ${bookname}` });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error..." });
    }
});

// view user
adminRoute.get('/viewuser', authenticate, async (req, res) => {
    // console.log("hi",req.role);

    try {
        const user = req.role
        res.status(200).json({ user })
    } catch (error) {
        console.log(error);

    }
})





const bookSchemas = mongoose.Schema({
    Bookname: { type: String, unique: true },
    AuthorName: String,
    BookType: String,
    Price: Number, // Ensuring price is stored as a number
    CoverImage: String // Storing the path or URL of the uploaded cover image
});

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Save with a unique timestamp-based name
    }
});



const upload = multer({ storage: storage });

const bmodel = mongoose.model("Books",bookSchemas) 

adminRoute.post("/addBooks", authenticate, upload.single('coverimage'), async (req, res) => {
    try {

    console.log(req.file);
    
        const userRole = req.role;

        // Check if the authenticated user's role is 'admin'
        if (userRole !== 'admin') {
            return res.status(403).json({ message: "Unauthorized: Only admin can add books" });
        }

        const { booknames, authornames, booktypes, prices } = req.body;

        // Check if the book already exists in the database
        const existingBook = await bmodel.findOne({ Bookname: booknames });
        if (existingBook) {
            return res.status(400).json({ message: `The book '${booknames}' is already added` });
        }

        // Get cover image file path if uploaded
        const coverImagePath = req.file ? req.file.path : null;

        // Create and save the new book
        const book = new bmodel({
            Bookname: booknames,
            AuthorName: authornames,
            BookType: booktypes,
            Price: parseFloat(prices),
            CoverImage: coverImagePath // Save the image path to the database
        });

        await book.save();
        console.log(`Successfully added book: ${book}`);
        return res.status(200).json({ message: `Successfully added book: ${booknames}` });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error..." });
    }
});





// view books

adminRoute.get("/viewBooks", async (req, res) => {
    try {
        const books = await bmodel.find()
        if (books.length > 0) {
            res.status(200).json({ books})
        } else {
            res.status(404).json({ message: "No Books" })
        }

    } catch (err) {
        res.status(500).json({ message: "Internal server error...." })
    }
})




adminRoute.delete('/deleteBook/:bookName', authenticate, async (req, res) => {
    try {
        const bookname = req.params.bookName;  // Normalize book name (case-insensitive)

        console.log("Book name to delete:", bookname);
        
        // Find the book by Bookname (case-insensitive)
        const book = await bmodel.findOne({ Bookname: bookname });

        if (!book) {
            return res.status(404).json({ message: `${bookname} not found` });
        }

        // Check if the user is an admin
        if (req.role !== 'admin') {
            return res.status(403).json({ message: "Access denied. Admins only." });
        }

        // Delete the book
        await bmodel.deleteOne({ Bookname: bookname });
        res.status(200).json({ message: `Successfully deleted ${bookname}` });
    } catch (err) {
        console.error("Error deleting book:", err);
        res.status(500).json({ message: "Internal server error" });
    }
});


// logout

adminRoute.post('/logout', (req, res) => {
    // Clear the JWT cookie
    res.clearCookie('authToken', { httpOnly: true, secure: true }); 

    res.json({ success: true });
});





export { adminRoute }