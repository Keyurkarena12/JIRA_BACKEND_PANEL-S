import express from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import {auth} from '../middlewares/authmiddlewares.js';

const router = express.Router();

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', passport.authenticate('google', {session: false}), (req, res) => {
    
        try {
            const token = jwt.sign({id:req.user.id,email:req.user.email},process.env.JWT_SECRET,{expiresIn:'1d'});
            res.redirect(`${process.env.FRONTEND_URL}/auth-success?token=${token}`);
        } catch (error) {
            console.error('Google OAuth callback error:', error);
            res.redirect(`${process.env.FRONTEND_URL}/login?error=${error.message}`);
            res.status(500).json({message:error.message});
        }
});

router.get("/me", auth,(req, res) => {
    res.json({user: req.user});
});

export default router;