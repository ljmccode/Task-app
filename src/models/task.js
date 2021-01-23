const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    description: {
        type: String,
        required: true,
        trim: true
    }, 
    completed: {
        type: Boolean, 
        default: false
    }
})

// if collection name not provided, collection will be deduced by
// taking the first arguemnt and  making it lowercase & plural
const Task = mongoose.model('Task', taskSchema)

module.exports = Task;