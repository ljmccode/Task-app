const express = require('express');
require('./db/mongoose');
const userRouter = require('./routers/user')
const taskRouter = require('./routers/task')

const app = express()

// Bind application-level middleware to an instance of the app object
app.use(express.json())
app.use(userRouter)
app.use(taskRouter)

module.exports = app