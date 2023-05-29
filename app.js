require('dotenv').config()

const express = require("express")
const ejs = require("ejs")
const bodyParser = require('body-parser')
const monngoose = require('mongoose')
const encrypt = require('mongoose-encryption')
const { default: mongoose } = require("mongoose")

const app = express()

app.use(express.static("public"))
app.use(bodyParser.urlencoded({ extended: true }))
app.set("view engine", "ejs")

monngoose.connect("mongodb://localhost:27017/userDB", { useNewUrlParser: true })

const userSchema = new mongoose.Schema({
    email: String,
    password: String
})

const secret = process.env.SECRET
userSchema.plugin(encrypt, { secret: secret, encryptedFields: ['password'] });

const User = new mongoose.model("user", userSchema)

app.get('/', (req, res) => {
    res.render("home")
})

app.get('/login', (req, res) => {
    res.render("login")
})

app.get('/register', (req, res) => {
    res.render("register")
})

app.post('/register', (req, res) => {
    const newUser = new User({
        email: req.body.username,
        password: req.body.password
    })

    newUser.save().then(res.render('secrets')).catch((err) => { console.error(err) })
})


app.post('/login', (req, res) => {
    const username = req.body.username;
    const password = req.body.password

    User.findOne({ email: username }).then((foundUser) => {
        if (foundUser) {
            if (foundUser.password === password) {
                res.render('secrets')
            }
        }
    }).catch((err) => { console.error(err) })
})


app.listen(3000, () => {
    console.log("App is listenning on Port 3000...")
})