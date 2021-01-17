const mongoose = require('mongoose')

mongoose.connect(('mongodb://127.0.0.1:27017/task-manager-api'), {
    useNewUrlParser: true,
    useUnifiedTopology: true, 
    useCreateIndex: true, 
})

const User = mongoose.model('User', {
    name: {
        type: String
    }, 
    age: {
        type: Number
    }
})

const me = new User({
    name: 'Skull Bull',
    age: 2
})

me.save()
    .then(() => console.log(me))
    .catch((error) => console.log(error.message))

// if collection name not provided, collection will be deduced by
// taking the first arguemnt and  making it lowercase & plural
const Task = mongoose.model('Task', {
    description: {
        type: String
    }, 
    completed: {
        type: Boolean
    }
})

const toDo = new Task({
    description: 'Go to the vet',
    completed: false
})

toDo.save()
    .then(() => console.log(toDo))
    .catch((error) => console.log(error.message))