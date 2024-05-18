require('dotenv').config()
const express = require("express")
const app = express()
const path = require("path")
const hbs = require("hbs")
const bcrypt = require("bcryptjs")
const cookieParser = require("cookie-parser")

const Register = require("./models/registers")
require('./db/conn')
const auth = require('./middleware/auth')
const port = process.env.PORT || 8000

const static_path = path.join(__dirname, "../public")
const template_path = path.join(__dirname, "../templates/views")
const partials_path = path.join(__dirname, "../templates/partials")

app.use(express.json())
app.use(cookieParser())
app.use(express.urlencoded({ extended: false }))

app.use(express.static(static_path))
app.set("view engine", "hbs") //setting up hbs
app.set("views", template_path) //hbs are locatd at temp folder
hbs.registerPartials(partials_path) //partials

app.get('/', (req, res) => {
    res.render("index")
})

app.get('/secret', auth, (req, res) => {
    // console.log(`The cookis are ${req.cookies.jwt}`)
    res.render("secret")
})

app.get('/login', (req, res) => {
    res.render("login")
})


//logout 
app.get('/logout',auth, async (req, res) => {
    try {
        // console.log(req.user)
        
        //for single logout
        // req.user.tokens = req.user.tokens.filter((curElement)=>{
        //     return curElement.token != req.token
        // })

        // logout from all devices
        req.user.tokens = []

        res.clearCookie("jwt")
        
        console.log("Logout Successfully")

        await req.user.save()
        res.render('login')

    } catch (error) {
        res.status(400).send()
    }
})

app.get('/register', (req, res) => {
    res.render("register")
})

//dta entry
app.post('/register', async (req, res) => {
    try {
        const password = req.body.password
        const confirmpassword = req.body.confirmpassword

        if (password === confirmpassword) {

            const emplRegister = new Register({
                firstname: req.body.firstname,
                lastname: req.body.lastname,
                email: req.body.email,
                gender: req.body.gender,
                phone: req.body.phone,
                age: req.body.age,
                password: password,
                confirmpassword: confirmpassword,
            })

            console.log(`The success part ${emplRegister}`)

            //genrating tokens
            const tokens = await emplRegister.genTokens()

            //password hashing => on register.js

            //stored on cookies
            res.cookie("jwt", tokens, {
                expires: new Date(Date.now() + 30000),
                httpOnly: true,
                // secure:true,
            })

            const registered = await emplRegister.save()
            res.status(201).render("index")
        }
        else {
            res.send("Passwords are not matching")
        }

    } catch (error) {
        res.status(400).send(error)
    }
})

//login validations
app.post('/login', async (req, res) => {
    try {
        const email = req.body.email
        const password = req.body.password

        const useremail = await Register.findOne({ email: email })

        //comp pass and bcrypt pass
        const ismatch = await bcrypt.compare(password, useremail.password)

        //generating tokens
        const tokens = await useremail.genTokens()
        // console.log("The token is ", tokens)

        //stored on cookies
        res.cookie("jwt", tokens, {
            expires: new Date(Date.now() + 600000),
            httpOnly: true,
            // secure:true,
        })

        // if (usermail.password === password) {
        if (ismatch) {
            res.status(201).render("index")
        }
        else {
            res.send("Invalid Password")
        }

    } catch (error) {
        res.status(400).send("Invalid Email")
    }
})

app.listen(port, () => {
    console.log(`Listening on port ${port}`)
})