import { Strategy as GithubStrategy } from "passport-github2";
import user from "../../models/user.js";


const githubLogin = (passport) => {
    passport.use(

        new GithubStrategy(
            {
                clientID: process.env.GITHUB_CLIENT_ID,
                clientSecret: process.env.GITHUB_CLIENT_SECRET,
                callbackURL: `${process.env.BACKEND_URL}/api/auth/github/callback`
            },
            async (accessToken, refreshToken, profile, done) => {


                // user.findOrCreate({
                //     githubId: profile.id
                // },

                // function(err, user) {
                //     return done(err, user);
                // }
                try {
                    let existingUser = await user.findOne({
                        githubId: profile.id
                    });

                    if (!existingUser) {
                        existingUser = await user.create({
                            name: profile.username,
                            email: profile.emails?.[0]?.value,
                            githubId: profile.id
                        });
                    }

                    return done(null, existingUser);
                } catch (error) {
                    return done(error, null);
                }



            }
        )

    )
}

export default githubLogin;