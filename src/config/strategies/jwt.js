import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import User from "../../models/user.js";

const jwtStrategy = (passport) => {
  passport.use(
    new JwtStrategy(
      {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: process.env.JWT_SECRET
      },
      async (payload, done) => {
        try {
          const user = await User.findById(payload.id);

          console.log("user:", user , "payload:", payload)
          if (user) {
            return done(null, user);
          }

          return done(null, false);
        } catch (error) {
          return done(error, false);
        }
      }
    )
  );
};

export default jwtStrategy;