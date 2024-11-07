import jwt from 'jsonwebtoken'
import dotenv from "dotenv"

dotenv.config()

const secretKey = process.env.secretKey;
const authenticate = (req,res,next) => {
  const cokkies=  req.headers.cookie
  console.log(cokkies);
  
    // req.cookies

    const cookie = cokkies.split(';')
    for(let cooki of cookie){
       const [name,tocken] = cooki.trim().split('=');
       if(name == 'authToken'){
         const verified =  jwt.verify(tocken,secretKey)
         console.log(verified);
        //  console.log("Username : ",verified.username);
         req.username = verified.username
         req.role = verified.role
        //  res.status(200).json({message: "success"})
         break;
         
       }
    }
    next()
}

export {authenticate};