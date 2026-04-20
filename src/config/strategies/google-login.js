import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../../models/user.js";

const googleLogin = (passport) => {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "http://localhost:5000/api/auth/google/callback"
      },
      async (accessToken, refreshToken, profile, done) => {
        console.log(profile);

        try {
          const user = await User.findOneAndUpdate(
            {
              googleId: profile?.id
            },
            {
              name: profile.displayName,
              email: profile.emails[0].value,
              picture: profile.photos[0].value
            },
            {
              new: true,
              upsert: true
            }
          );

          done(null, user);
        } catch (error) {
          done(error, null);
        }
      }
    )
  );
};

export default googleLogin;