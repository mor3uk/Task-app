const express = require('express');
const multer  = require('multer');
const sharp   = require('sharp');
const mail    = require('../emails/account.js');
const User    = require('../models/user.js');
const auth    = require('../middleware/auth.js');

const router = new express.Router();

/**
 * Create a new user
 */
router.post('/users', async (req, res) => {
    const user = new User(req.body);

    try {
        await user.save();
        let token = await user.generateAuthToken();
        mail.sendWelcomeEmail(user.email, user.name);

        res.status(201).send( { user, token } );
    } catch (e) {
        res.status(400).send(e);
    }
});

/**
 * Log in as a user by email and password
 */
router.post('/users/login', async (req, res) => {
    try {
        let user = await User.findByCredentials(req.body.email, req.body.password);
        let token = await user.generateAuthToken();

        res.status(200).send( { user, token } );
    } catch (e) {
        res.status(400).send();
    }
});

/**
 * Log out user
 */
router.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => token.token !== req.token);
        await req.user.save();

        res.send();
    } catch (e) {
        res.status(500).send();
    }
});

/**
 * Stop all sessions
 */
router.post('/users/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = [];
        await req.user.save();

        res.send();
    } catch (e) {
        res.status(500).send();
    }
});

/**
 * Read profile
 */
router.get('/users/me', auth, async (req, res) => {
    res.send(req.user);
});

/**
 * Update a user
 */
router.patch('/users/:id', auth, async (req, res) => {
    let updates = Object.keys(req.body);
    let propsToUpdate = ['name', 'email', 'password', 'age'];
    let validUpdates = updates.every((update) => propsToUpdate.includes(update));

    if (!validUpdates) {
        return res.status(400).send();
    }

    try {
        updates.forEach((update) => {
            req.user[update] = req.body[update];
        });

        await req.user.save();

        res.send(req.user);
    } catch (e) {
        res.status(500).send(e);
    }
});

/**
 * Delete a user
 */
router.delete('/users/me', auth, async (req, res) => {
    try {
        await req.user.remove();
        mail.sendCancelEmail(req.user.email, req.user.name);
        
        res.send(req.user);
    } catch (e) { 
        res.status(500).send();
    }
});

const upload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/.(jpeg|jpg|png})$/)) {
            return cb(new Error('Please upload an image'));
        }

        cb(undefined, true);
    }
});

/**
 * Upload avatar
 */
router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    let buffer = await sharp(req.file.buffer).resize({
        width: 500,
        height: 650
    }).png().toBuffer();

    req.user.avatar = buffer;
    await req.user.save();

    res.send();
}, (e, req, res, next) => {
    res.status(400).send(e.message);
});

/**
 * Delete avatar
 */
router.delete('/users/me/avatar', auth, async (req, res) => {
    if (req.user.avatar === undefined) {
        return res.status(400).send();
    }

    req.user.avatar = undefined;
    await req.user.save();

    res.send();
});

/**
 * Get avatar by id
 */
router.get('/users/:id/avatar', async (req, res) => {
    let user = await User.findById(req.params.id);

    if (!(user && user.avatar)) {
        return res.status(404).send();
    }

    res.set('Content-type', 'image/png');
    res.send(user.avatar);
});

module.exports = router;