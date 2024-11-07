import jwt from 'jsonwebtoken'
import dotenv from "dotenv"

dotenv.config()

const secretkey = process.env.secretkey
const authenticate = (req,res,next)=>{
    const cookies = req.headers.cookies
    console.log(cookies);

    const cookie = cookies.split(';')
    for(let cooki of cookie){
        const [name, token] = cooki.trim().split('=')
        if(name=='authToken'){
            const verified = jwt.verify(token,secretkey)
            console.log(verified);
            req.username = verified.username
            req.Role = verified.Role
            console.log(verified.Role);
            
            break
            
        }
    }
    next()
    
}

export {authenticate}