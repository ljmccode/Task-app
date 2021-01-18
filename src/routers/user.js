const express = require('express');
const mongoose = require('mongoose'); 
const User = require('../models/user')
const router = new express.Router()

// ******************************
// User REST API Endpoints
// ******************************

// Post new user
router.post('/users', async (req, res)=> {
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
router.get('/users', async (req, res) => {
    try {
        const users = await User.find({})
        res.send(users)
    } catch(error) {
        res.status(500).send(error.message)
    } 
})

// Fetch user by id
router.get('/users/:id', async (req, res) => {
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
router.patch('/users/:id', async (req, res) => {
    const _id = req.params.id
    if (!mongoose.isValidObjectId(_id)){
        return res.status(400).send('Invalid ID') 
    }

    // grabs an array of keys from requested updates & determines if user can update
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'password', 'age']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid update request' })
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

// Delete user by id
router.delete('/users/:id', async (req, res) => {
    const _id = req.params.id
    if (!mongoose.isValidObjectId(_id)){
        return res.status(400).send('Invalid ID') 
    }

    try {
        const user = await User.findByIdAndDelete(_id)
        if (!user) {
            return res.status(404).send('No user found by given id')
        }
        res.send(user)
    } catch (e) {
        res.status(500).send(e.message)
    }

})

module.exports = router