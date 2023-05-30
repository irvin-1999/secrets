require('dotenv').config()

const express = require("express")
const ejs = require("ejs")
const bodyParser = require('body-parser')
const monngoose = require('mongoose')
const { default: mongoose } = require("mongoose")
const session = require("express-session")
const passport = require('passport')
const passportLocalMongoose = require("passport-local-mongoose")


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
    password: String
})


userSchema.plugin(passportLocalMongoose)
// const secret = process.env.SECRET
// userSchema.plugin(encrypt, { secret: secret, encryptedFields: ['password'] });

const User = new mongoose.model("user", userSchema)

passport.use(User.createStrategy())

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser())

app.get('/', (req, res) => {
    res.render("home")
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