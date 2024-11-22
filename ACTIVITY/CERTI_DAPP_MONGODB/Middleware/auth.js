import jwt from "jsonwebtoken";
const secretKey = "hihi"

const authenticate = (req, res, next) => {
    const cookies = req.headers.cookie
    const cooki = cookies.split(';')
    for (let cookie of cooki) {
        const [name, token] = cookie.trim().split('=')
        if (name == 'authToken') {
            const verified = jwt.verify(token, secretKey)
            console.log("Verified: ", verified)
            req.username = verified.username
            req.role = verified.role
            // console.log(req.role);
            
            break;
        }
    }
    next()
}

export { authenticate }
