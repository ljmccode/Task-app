// CRUD

const mongodb = require('mongodb')
// needed to initialize connection
// gives us access to the function necessary to connect it to the database
// so we can perform our CRUD operations
const MongoClient = mongodb.MongoClient

const connectionURL = 'mongodb://127.0.0.1:27017'
const databaseName = 'task-manager'

MongoClient.connect(connectionURL, { useNewUrlParser: true }, (error, client) => {
    if (error) {
        return console.log('Unable to connect to database!')
    }

    console.log('Connected correctly')
})