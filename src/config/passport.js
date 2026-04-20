import passport from "passport";
import googleLogin from "./strategies/google-login.js";
import jwtStrategy from "./strategies/jwt.js";
import githubLogin from "./strategies/github-login.js";
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import User from '../models/user.js';

googleLogin(passport);
githubLogin(passport);
jwtStrategy(passport);