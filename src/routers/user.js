const express = require('express');
const mongoose = require('mongoose'); 
const User = require('../models/user');
const auth = require('../middleware/auth')
const router = new express.Router();

// ******************************
// User REST API Endpoints
// ******************************

// Post new user
router.post('/users', async (req, res)=> {
    const user = new User(req.body)
    try {
        await user.save()
        const token = await user.generateAuthToken();
        res.status(201).send({ user, token })
    } catch (error) {
        res.status(400).send(error.message)
    }
});

// Log in user
router.post('/users/login', async (req, res) => {
    try {
        // creating our own function findByCredentials
        const user = await User.findByCredentials(req.body.email, req.body.password);
        const token = await user.generateAuthToken();
        res.send({ user, token })
    } catch (error) {
        res.status(400).send()
    }
})

// Fetch auth user
router.get('/users/me', auth, async (req, res) => {
    // gets req.user from middleware
    res.send(req.user)
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
        const user = await User.findById(_id)
        updates.forEach(update => user[update] = req.body[update])
        await user.save()

        // can't use method below because it bypasses mongoose
        // const user = await User.findByIdAndUpdate(_id, req.body, { new: true, runValidators: true })
        
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