const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Task = require('./task')

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
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    avatar: {
        type: Buffer
    }
}, {
    timestamps: true
})

// virtual property- not actual data stored in datebase
// it's a relationship between two entities
// for mongoose to figure out who owns what and how they are related
userSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'owner'
})

// instance methods will use this keyword so can't use arrow function
// these methods are accessible on the instance (aka the specific user here) 

// when a mongoose doc is passed to res.send, mongoose converts the object to JSON
// The toJSON method customizes the object that mongoose will send
userSchema.methods.toJSON = function () {
    const user = this
    // give the raw profile data
    const userObject = user.toObject()
    // don't want to send private/senstive/unneeded data in the response
    delete userObject.password
    delete userObject.tokens
    delete userObject.avatar

    return userObject
}

// generates token
userSchema.methods.generateAuthToken = async function () {
    const user = this;
    const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET);

    // save token to the tokens array in the database
    user.tokens = user.tokens.concat({ token });
    await user.save();
    return token;
}

// static methods are accessible on the model, sometimes called model methods
userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email })

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

// Middleware
// Hash the plain text password before saving 
userSchema.pre('save', async function (next) {
    // this gives us access to the individual user that's about to be saved
    const user = this;

    // will be true when user is first created and when its updated
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
    }

    // if next isn't called, function would run forever thinking we're still
    // running some code before we save the user
    next()
})

// Delete user's tasks when before user is removed 
userSchema.pre('remove', async function (next) {
    const user = this;
    await Task.deleteMany({ owner: user._id })

    next()
})

const User = mongoose.model('User', userSchema)

module.exports = User