const mongoose = require('mongoose')
const bycrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")

const employeeSchema = new mongoose.Schema({
    firstname: {
        type: String,
        required: true,
    },
    lastname: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    // gender: {
    //     type: String,
    //     required: true,
    // },
    phone: {
        type: Number,
        required: true,
        unique: true,
    },
    age: {
        type: Number,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    confirmpassword: {
        type: String,
        required: true,
    },
    tokens: [{
        token: {
            type: String,
            required: true,
        }
    }]
})

//genrating tokens
employeeSchema.methods.genTokens = async function () {
    try {
        const token = await jwt.sign({ _id: this._id }, process.env.SECRET_KEY)
        this.tokens = this.tokens.concat({ token: token })
        await this.save()
        return token

    } catch (error) {
        resizeBy.send(`The error is occured ${error}`)
        console.log(`The error is occured ${error}`)
    }
}

//password hashing before saved
employeeSchema.pre("save", async function (next) {

    if (this.isModified('password')) {
        this.password = await bycrypt.hash(this.password, 10)
        this.confirmpassword = await bycrypt.hash(this.password, 10)
    }
    next()
})

//creating collection
const Register = new mongoose.model("Register", employeeSchema)

module.exports = Register