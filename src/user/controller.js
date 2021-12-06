const bcrypt = require('bcrypt');
const localStrategy = require('passport-local');
const facebookStrategy = require("passport-facebook");
const UserModel = require('./model');


module.exports = {

    userSignUp: async (req, res) => {
        try {
            const saltRounds = 10;
            const encryptedPassword = await bcrypt.hash(req.body.password, saltRounds);
            const userData = await UserModel.create({
                name: req.body.name,
                email: req.body.email,
                password: encryptedPassword
            });
            console.log(userData);
            res.status(200).json({
                data: `User with Name- ${userData.name} signed up successfully!`
            });
        } catch (err) {
            console.log(err);
            res.status(400).json({
                status: "Fail",
                err: err.message
            });
        }
    },


    signinAuth: (passport) => {
        passport.use(new localStrategy({ usernameField: 'email' },
        async (username, password, done) => {
                try {
                    const getUser = await UserModel.findOne({ email: username });
                    console.log(getUser);
                    if (!getUser) {
                        return done(null, false, { message: "Incorrect Email" });
                    }
                    const validPassword = await bcrypt.compare(
                        password,
                        getUser.password
                    );
                    if (!validPassword) {
                        return done(null, false, {
                            message: "Incorrect Password.",
                        });
                    }
                    done(null, getUser);
                } catch (err) {
                    done(err);
                }
            }
        ));

        const FB_APP_ID = 883101525731911;
        const FB_APP_SECRET = "dce5747553d4f2f159ce6e41ca1604b3";
        passport.use(new facebookStrategy({
                    clientID: FB_APP_ID,
                    clientSecret: FB_APP_SECRET,
                    callbackURL: "/auth/facebook/callback",
                    profileFields: ["id", "displayName", "email", "gender"],
                },
                async (accessToken, refreshToken, profile, done) => {
                    console.log("Profile", profile);
                    try {
                        const getUser = await UserModel.findOne({
                            userId: profile.id,
                        });
                        if (getUser) {
                            console.log("Fetched User", getUser);
                            return done(null, getUser);
                        }
                        const createdUser = await UserModel.create({
                            userId: profile.id,
                            name: profile.displayName,
                            email: profile.emails ? profile.emails[0].value : "",
                            token: accessToken,
                        });
                        done(null, createdUser);
                    } catch (err) {
                        done(err);
                    }
                }
            )
        );

        passport.serializeUser((user, done) => {
            done(null, user.id);
        });
        
        passport.deserializeUser((id, done) => {
            UserModel.findById(id, (err, user) => {
                done(err, user);
            });
        });
    }

}


// module.exports = { userSignUp, signinAuth, facebookAuth };
