const express = require('express');
require('./db/mongoose');
const User = require('./models/user')
const Task = require('./models/task')
const mongoose = require('mongoose');

const app = express()
const port = process.env.PORT || 3000

// Automatically parses JSON to an object
app.use(express.json())

// REST API Endpoints
app.post('/users', (req, res)=> {
    const user = new User(req.body)

    user.save()
        .then(() => res.status(201).send(user))
        .catch((error) => {
            res.status(400).send(error.message)
        })
});

app.get('/users', (req, res) => {
    User.find({})
        .then((users) => res.send(users))
        .catch((error) => res.status(500).send(error.message))
})

app.get('/users/:id', (req, res) => {
    const _id = req.params.id
    if (!mongoose.isValidObjectId(_id)){
        return res.status(400).send('Invalid ID!')
    }
    // mongoose will automatically convert string id into object ID
    User.findById(_id).then((user) => {
        if(!user) {
            return res.status(404).send()
        }
        res.send(user)
        })
        .catch((error) => res.status(500).send(error.message))
})

app.post('/tasks', (req, res) => {
    const task = new Task(req.body)
    task.save()
        .then(() => res.status(201).send(task))
        .catch((error) => res.status(400).send(error))
})

app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
});