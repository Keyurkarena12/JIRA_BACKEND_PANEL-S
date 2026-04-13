import jwt from "jsonwebtoken"
import User from "../models/user.js"


export const auth = async(req,res,next)=>{
   
    let token;
    if(req.headers.authorization && req.headers.authorization.startsWith("Bearer ")){
        try {
            token = req.headers.authorization.split(" ")[1];

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            console.log(decoded);

            req.user = await User.findById(decoded.id).select("-password");

            if(!req.user){
                return res.status(401).json({message: "Not authorized, no token"});
            }

            next();

        } catch (error) {
            console.log(error);
            return res.status(401).json({message: "Not authorized, token failed"});
        }

        if(!token){
            return res.status(401).json({message: "Not authorized, no token"});
        }
        
    }
    
}

