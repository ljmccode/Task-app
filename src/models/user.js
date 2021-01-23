const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    }, 
    email: {
        type: String,
        unique: true,
        required: true, 
        trim: true,
        lowercase: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Email is invalid')
            }
        }
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minLength: 7,
        validate(value) {
            if (value.toLowerCase().includes('password')) {
                throw new Error('Password cannot contain "Password"')
            }
        }
    },
    age: {
        type: Number, 
        default: 0,
        validate(value) {
            if (value < 0) {
                throw new Error('Age must be a positive number')
            }
        }
    }
})

// generates token
// will use this keyword so can't use arrow function
// our methods are accessible on the instances sometimes instance methods
userSchema.methods.generateAuthToken = async function () {
    const user = this;
    const token = jwt.sign( {_id:user._id.toString() }, 'thisisthesecret');
    return token;
}

// static methods are accessible on the model, sometimes called model methods
userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne( { email })

    // better to not be too specific about login errors as to not help any fraudulent users narrow down issues
    if (!user) {
        throw new Error('Unable to login')
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
        throw new Error('Unable to login')
    }
    return user
}

// Has the plain text password before saving
userSchema.pre('save', async function (next) {
    // this gives us access to the individual user that's about to be saved
    const user = this;

    // will be true when user is first created and when its updated
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
    }

    console.log('just before saving!')

    // if next isn't called, function woudl run forever thinking we're still
    // running some code before we save the user
    next()
})
 
const User = mongoose.model('User', userSchema)

module.exports = User