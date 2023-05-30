require('dotenv').config()

const express = require("express")
const ejs = require("ejs")
const bodyParser = require('body-parser')
const monngoose = require('mongoose')
const { default: mongoose } = require("mongoose")
const session = require("express-session")
const passport = require('passport')
const passportLocalMongoose = require("passport-local-mongoose")
const findOrCreate = require("mongoose-findorcreate")
const GoogleStrategy = require('passport-google-oauth20').Strategy;


const app = express()

app.use(express.static("public"))
app.use(bodyParser.urlencoded({ extended: true }))
app.set("view engine", "ejs")

app.use(session({
    secret: "Our Little Secret.",
    resave: false,
    saveUninitialized: false,
}))

app.use(passport.initialize());
app.use(passport.session())

monngoose.connect("mongodb://localhost:27017/userDB", { useNewUrlParser: true })

const userSchema = new mongoose.Schema({
    email: String,
    password: String,
    googleId: String
})


userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate)

// const secret = process.env.SECRET
// userSchema.plugin(encrypt, { secret: secret, encryptedFields: ['password'] });

const User = new mongoose.model("user", userSchema)

passport.use(User.createStrategy())

passport.serializeUser(function (user, done) {
    done(null, user);
});

passport.deserializeUser(function (user, done) {
    User.findById(id, function (err, user) {
        done(null, user);
    })
});

passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "https://localhost:3000/auth/google/secrets",
},
    function (accessToken, refreshToken, profile, cb) {
        User.findOrCreate({ googleId: profile.id }, function (err, user) {
            return cb(err, user);
        });
    }
));

app.get('/', (req, res) => {
    res.render("home")
})

app.get('/auth/google',
    passport.authenticate('google', { scope: ['profile'] }));

app.get('/auth/google/secrets',
    passport.authenticate('google', { failureRedirect: '/login' }),
    function (req, res) {
        // Successful authentication, redirect secrets.
        res.redirect('/secrets');
    })

app.get('/login', (req, res) => {
    res.render("login")
})

app.get('/register', (req, res) => {
    res.render("register")
})

app.get('/secrets', (reg, res) => {
    if (reg.isAuthenticated()) {
        res.render('secrets')
    } else {
        res.redirect('login')
    }
})

app.get('logout', (req, res) => {
    req.logOut()
    res.redirect("/")
})

app.post('/register', (req, res) => {
    User.register({ username: req.body.username }, req.body.password, function (err, user) {
        if (err) {
            console.log(err)
            res.redirect('/register')
        } else {
            passport.authenticate('local')(req, res, function () {
                res.redirect('/secrets')
            })
        }
    })
})


app.post('/login', (req, res) => {
    const user = new User({
        username: req.body.username,
        password: req.body.password
    })

    req.logIn(user, function (err) {
        if (err) {
            console.log(err)
        } else {
            passport.authenticate('local')(req, res, function () {
                res.redirect('/secrets')
            })
        }
    })
})


app.listen(3000, () => {
    console.log("App is listenning on Port 3000...")
})