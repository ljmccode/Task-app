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

// Log out user from currect session
router.post('/users/logout', auth, async (req, res) => {
    try {
        // filter out the token that was used for that specific login
        // A user may have many different tokens for multiple devices and we only 
        // want to log them out for that specific device
        req.user.tokens = req.user.tokens.filter(token => {
            return token.token !== req.token
        })
        await req.user.save()
        res.send({ message: 'User logged out' })
    } catch (e) {
        res.status(500).send(e)
    }   
})

// Log out user from all sessions
router.post('/users/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()
        res.status(200).send( {message: 'Logged out from all sessions'})
    } catch(e) {
        res.status(500).send(e)
    }
})

// Fetch auth user
router.get('/users/me', auth, async (req, res) => {
    // gets req.user from middleware
    res.send(req.user)
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
router.delete('/users/me', auth, async (req, res) => {
    try {
        // remove the user who is authenticated
        // we have req.user from the auth middleware
        await req.user.remove()
        res.send(req.user)
    } catch (e) { 
        res.status(500).send(e.message)
    }

})

module.exports = router