import express, { json } from "express";
import { adminRoute } from "./Routers/adminRoute.js";
import dotenv from "dotenv"
import cors from "cors"
import cookieParser from 'cookie-parser';
import path from "path";
dotenv.config()

const app = express()
const __dirname = new URL('.', import.meta.url).pathname;


app.use(cors({
    origin:'http://127.0.0.1:5500',
    credentials:true
}))
app.use(json())
app.use(cookieParser())
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/',adminRoute)
const port= process.env.port
app.listen(port,()=>{
    console.log(`Server is running on http://localhost:${port}`)
})