import express from "express";
import { forgotpassword, login, register, resetpassword, googleCallback, getuser, logout, githubCallback, getCurrentUser, updateProfile } from "../controllers/Auth/register.js";
import passport from "passport";
import { auth } from "../middlewares/authmiddlewares.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", forgotpassword);
router.post("/reset-password", resetpassword);


router.get('/google',passport.authenticate('google',{scope:['profile','email']}))

router.get("/google/callback",passport.authenticate('google',{session:false}),
     googleCallback
 )


 router.get('/user',
    passport.authenticate('jwt',{session:false}),
    getuser
 ) 

 router.get('/github',passport.authenticate('github',{
   scope:['user:email']
 }))

 router.get('/github/callback',passport.authenticate('github',{session:false,failureRedirect:'/login'}),
     githubCallback
 )

 router.post('/logout',logout)

 router.get('/current-user',auth,getCurrentUser)

 router.post('/update-profile',auth,updateProfile)


export default router;