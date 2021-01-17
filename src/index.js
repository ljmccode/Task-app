const express = require('express');
require('./db/mongoose');
const User = require('./models/user')

const app = express()
const port = process.env.PORT || 3000

// Automatically parses JSON to an object
app.use(express.json())

// Route handler
app.post('/users', (req, res)=> {
    const user = new User(req.body)

    user.save()
        .then(() => {res.send(user)})
        .catch((error) => {
            res.status(400).send(error)
        })
})

app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
});