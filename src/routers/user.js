const express = require('express');
const multer = require('multer');
const sharp = require('sharp')
const User = require('../models/user');
const auth = require('../middleware/auth');
const { sendWelcomeEmail, sendCancellationEmail } = require('../emails/account')
const router = new express.Router();

// ******************************
// User REST API Endpoints
// ******************************

// Post new user
router.post('/users', async (req, res)=> {
    const user = new User(req.body);
    try {
        await user.save();;
        sendWelcomeEmail(user.email, user.name);
        const token = await user.generateAuthToken();
        res.status(201).send({ user, token });
    } catch (error) {
        res.status(400).send(error.message);
    }
});

// Log in user
router.post('/users/login', async (req, res) => {
    try {
        // creating our own function findByCredentials to find user and check password
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
        // A user may have many different tokens for multiple devices and we only  
        // want to log them out for that specific device
        // this assigns req.user.token to an array of tokens that doesn't include current one
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
    // auth middleware adds user property to request so we can use that
    res.send(req.user)
})

// Update user
router.patch('/users/me', auth, async (req, res) => {
    
    // grabs an array of keys from requested updates & determines if user can update
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'password', 'age']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid update request' })
    }

    try {
        // grabs req.user provided from auth middleware
        updates.forEach(update => req.user[update] = req.body[update])
        await req.user.save()
        res.send(req.user)
    } catch (e) {
        res.status(500).send(e.message)
    }
})

// Delete user
router.delete('/users/me', auth, async (req, res) => {
    try {
        // remove the user who is authenticated
        await req.user.remove()
        sendCancellationEmail(req.user.email, req.user.name);
        res.send(req.user)
    } catch (e) { 
        res.status(500).send(e.message)
    }

})

const upload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error ('Please upload an image'))
        }
        // error is undefined and accept file is true
        cb(undefined, true)
    }
})

// Create or update user avatar
router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    // since we are not setting a destination directory in multer (dest), 
    // file can be accessed in this callback via req.file.buffer

    // sharp allows for auto-cropping and image formatting
    const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer()
    req.user.avatar = buffer
    await req.user.save()
    res.send()
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message })
})

// Delete user avatar
router.delete('/users/me/avatar', auth, async (req, res) => {
    req.user.avatar = undefined
    await req.user.save()
    res.send()
})

// Serve up user avatar image
router.get('/users/:id/avatar', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)

        if (!user || !user.avatar) {
            throw new Error()
        }
        // set response header
        await res.set('Content-Type', 'image/png')
        res.send(user.avatar)
    } catch (e) {
        res.status(404).send()
    }
})


module.exports = router