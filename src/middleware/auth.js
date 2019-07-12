const jwt  = require('jsonwebtoken');
const User = require('../models/user.js');

/**
 * Authenticate a user
 * @param {object} req - request 
 * @param {object} res - response
 * @param {functon} next - goes on
 */
const auth = async (req, res, next) => {
    try {
        let token   = req.header('Authorization').replace('Bearer ', '');
        let decoded = jwt.verify(token, process.env.TOKEN_SECRET);
        let user    = await User.findOne({
            _id: decoded.id,
            'tokens.token': token
        });

        if (!user) {
            throw new Error();
        }

        req.token = token;
        req.user = user;
        next();
    } catch (e) {
        res.status(401).send('Please authenticate');
    }
};

module.exports = auth;