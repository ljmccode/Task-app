// if collection name not provided, collection will be deduced by
// taking the first arguemnt and  making it lowercase & plural
const Task = mongoose.model('Task', {
    description: {
        type: String,
        required: true,
        trim: true
    }, 
    completed: {
        type: Boolean, 
        default: false
    }
});