/*
1). Create a signup API and form(using ejs template) for user to signup 
[Mandatory data: name, email, password]. Use mongodb to store user 
information like name, email and password(encrypt the password using 
bcrypt [https://www.npmjs.com/package/bcrypt]).

2). Update the  passport local authentication strategy taught in the session 
to use the user information stored in mongodb.

3). Setup dummy facebook app(https://developers.facebook.com/) and use it along 
with passport-facebook(http://www.passportjs.org/docs/facebook/) to login. 
To successfully use facebook login for testing purpose, the dummy app has 
to be in development mode.
*/


const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const session = require('express-session');
const passport = require('passport');
const { userSignUp, signinAuth } = require('./user/controller');
// const controllerFunc = require('./user/controller');
// require('./user/controller')();

const app = express();

const PORT = 5000;

mongoose.connect("mongodb://localhost:27017/usersDB", { useNewUrlParser: true });

mongoose.connection.on("error", err => {
    console.log("err", err);
});

mongoose.connection.on("connected", (err, res) => {
    console.log("Mongoose is Connected!");
});

signinAuth(passport);
// app.use("/login", userAuthRouter);
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({ secret: "some_secret_key", resave: true, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

app.set('view engine', 'ejs');


app.get("/", (req, res) => {
    res.render('signupForm');
});

app.post("/signup", userSignUp);

app.get("/login", (req, res) => {
    res.render('loginForm');
});

app.post("/login", passport.authenticate("local", {failureRedirect: "/login"}), (req, res) => {
    res.send('Welcome!');
});

app.get('/fb', passport.authenticate('facebook', { authType: 'reauthenticate', scope: ['user_friends', 'public_profile','email'] }));

app.get('/auth/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/login' }), (req, res) => {
    res.send('Successfully Logged In using Facebook!');
});

app.listen(PORT, () => {
    console.log(`The server is running on PORT ${PORT}....`);
});
