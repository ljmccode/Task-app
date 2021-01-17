const mongoose = require('mongoose');
const validator = require('validator')

mongoose.connect(('mongodb://127.0.0.1:27017/task-manager-api'), {
    useNewUrlParser: true,
    useUnifiedTopology: true, 
    useCreateIndex: true, 
})

const User = mongoose.model('User', {
    name: {
        type: String,
        required: true,
        trim: true
    }, 
    email: {
        type: String,
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

const me = new User({
    name: 'Dinky',
    email: 'dinky@gmail.com',
    password: '123Pass'
    
})

me.save()
    .then(() => console.log(me))
    .catch((error) => console.log(error.message))

// if collection name not provided, collection will be deduced by
// taking the first arguemnt and  making it lowercase & plural
// const Task = mongoose.model('Task', {
//     description: {
//         type: String
//     }, 
//     completed: {
//         type: Boolean
//     }
// })

// const toDo = new Task({
//     description: 'Go to the vet',
//     completed: false
// })

// toDo.save()
//     .then(() => console.log(toDo))
//     .catch((error) => console.log(error.message))