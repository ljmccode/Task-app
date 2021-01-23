const jwt = require('jsonwebtoken');
const User = require('../models/user');


const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '');
        const decoded = jwt.verify(token, 'thisisthesecret');

        // find the user with the correct id who has that authentication token still stored
        const user = await User.findOne({ _id: decoded._id, 'tokens.token': token });

        if (!user) {  
            throw new Error();
        }

        // store information of user we found into req header 
        // will provide user info to the route handler so it doesn't have to search for the user again
        req.token = token
        req.user = user
        next();
    } catch (e) {
        res.status(401).send({ error: 'Please Authenticate' });
    }
};

module.exports = auth;