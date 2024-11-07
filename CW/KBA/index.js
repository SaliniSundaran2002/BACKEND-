// import express 
import express, { json } from 'express';
import bcrypt from 'bcrypt'
import { adminRoute } from './ROUTES/adminRoutes.js';
import dotenv from "dotenv"
import cors from 'cors';
import cookieParser from 'cookie-parser';


dotenv.config()
// create a object/instance
const app = express();
app.use(cors({
    origin:'http://127.0.0.1:5501',
    credentials:true //accept from all ports origin:'http://127.0.0.1:8001'

}))
app.use(json())
app.use(cookieParser())
app.use('/',adminRoute)
// assign port number
const port = process.env.port;
// declare a map data structure like key, values pair
app.listen(port, () => {
    console.log(`server is listening to port ${port}`)
})
