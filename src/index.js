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
// Post new user
app.post('/users', async (req, res)=> {
    const user = new User(req.body)
    try {
        await user.save()
        // res.status will only run if Promise above is fulfilled
        res.status(201).send(user)
    } catch (error) {
        res.status(400).send(error.message)
    }
});

// Fetch all users
app.get('/users', async (req, res) => {
    try {
        const users = await User.find({})
        res.send(users)
    } catch(error) {
        res.status(500).send(error.message)
    }
})

// Fetch user by id
app.get('/users/:id', async (req, res) => {
    const _id = req.params.id
    if (!mongoose.isValidObjectId(_id)){
        return res.status(400).send('Invalid ID') 
    }
    try {
        // mongoose will automatically convert string id into object ID
        const user = await User.findById(_id)
        if (!user) {
            return res.status(404).send('User not found')
        }
        res.send(user)
    } catch (error) {
        res.status(500).send(error.message)
    }
})

// Update user by id
app.patch('/users/:id', async (req, res) => {
    const _id = req.params.id

    // grabs an array of keys from requested updates & determines if user can update
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'password', 'age']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates' })
    }

    if (!mongoose.isValidObjectId(_id)){
        return res.status(400).send('Invalid ID') 
    }
    try {
        const user = await User.findByIdAndUpdate(_id, req.body, { new: true, runValidators: true })
        if (!user) {
            return res.status(404).send('No user found by id')
        }
        res.send(user)
    } catch (e) {
        res.status(500).send(e.message)
    }
})


// Post new task
app.post('/tasks', async (req, res) => {
    const task = new Task(req.body)

    try {
        await task.save()
        res.status(201).send(task)
    } catch (error) {
        res.status(400).send(error.message)
    }
})

// Fetch all tasks
app.get('/tasks', async (req, res) => {
    try {
        const tasks = await Task.find({})
        res.send(tasks)
    } catch (error) {
        res.status(500).send(error.message)
    }
})

// Fetch task by id
app.get('/tasks/:id', async (req, res) => {
    const _id = req.params.id
    if (!mongoose.isValidObjectId(_id)){
        return res.status(400).send('Invalid ID')
    }

    try {
        const task = await Task.findById(_id)
        if (!task) {
            return res.status(404).send('No task found')
        }
        res.send(task)
    } catch (error) {
        res.status(500).send(error.message)
    }
})

app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
});