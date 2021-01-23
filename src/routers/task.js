const express = require('express');
const mongoose = require('mongoose'); 
const Task = require('../models/task');
const router = new express.Router();

// ******************************
// Task REST API Endpoints
// ******************************

// Post new task
router.post('/tasks', async (req, res) => {
    const task = new Task(req.body)

    try {
        await task.save()
        res.status(201).send(task)
    } catch (error) {
        res.status(400).send(error.message)
    }
})

// Fetch all tasks
router.get('/tasks', async (req, res) => {
    try {
        const tasks = await Task.find({})
        res.send(tasks)
    } catch (error) {
        res.status(500).send(error.message)
    }
})

// Fetch task by id
router.get('/tasks/:id', async (req, res) => {
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

// Update task by id
router.patch('/tasks/:id', async (req, res) => {
    const _id = req.params.id;
    if (!mongoose.isValidObjectId(_id)){
        return res.status(400).send('Invalid ID') 
    }
    
    const updates = Object.keys(req.body)
    const allowedUpdates = ['description', 'completed']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        res.status(400).send({ error: 'Invalid update request' })
    }

    try {
        const task = await Task.findById(_id);
        updates.forEach(update => task[update] = req.body[update]);
        await task.save();
        
        if (!task) {
            return res.status(404).send('No task found with given id')
        }
        res.send(task)
    } catch (error) {
        res.status(500).send(error.message)
    }

})

// Delete task by id
router.delete('/tasks/:id', async (req, res) => {
    const _id = req.params.id
    if (!mongoose.isValidObjectId(_id)){
        return res.status(400).send('Invalid ID') 
    }

    try {
        const task = await Task.findByIdAndDelete(_id)
        if (!task) {
            return res.status(404).send('No task found by given id')
        }
        res.send(task)
    } catch (e) {
        res.status(500).send(e.message)
    }

})

module.exports = router