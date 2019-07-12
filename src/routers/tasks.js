const express = require('express');
const Task    = require('../models/task.js');
const auth    = require('../middleware/auth.js');

const router = new express.Router();

/**
 * Create a new task
 */
router.post('/tasks', auth, async (req, res) => {
    const task = new Task(req.body);
    task.owner = req.user._id;

    try {
        await task.save();
        res.status(201).send(task);
    } catch (e) {
        res.status(400).send(e);
    }
});

/**
 * Read tasks
 */
router.get('/tasks', auth, async (req, res) => {
    let sort  = {};
    let match = {
        owner: req.user._id,
    }

    // Filter tasks
    if (req.query.completed) {
        match.completed = req.query.completed === 'true';
    }

    // Sort tasks
    if (req.query.sortBy) {
        let sortParts      = req.query.sortBy.split(':');
        sort[sortParts[0]] = sortParts[1] === 'desc' ? -1: 1;
    }

    try {
        let tasks = await Task.find(match, null, {
            limit: parseInt(req.query.limit),
            skip: parseInt(req.query.skip) * ( parseInt(req.query.limit) || 1 ),
            sort
        });
        res.send(tasks);
    } catch (e) {
        res.status(500).send();
    }
});

/**
 * Read a task by id
 */
router.get('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id;
  
    try {
        let task = await Task.findOne({
            _id,
            owner: req.user._id
        });
        if (!task) {
            return res.status(404).send();
        }

        res.send(task);
    } catch (e) {
        res.status(500).send();
    }
});

/**
 * Update a task by id
 */
router.patch('/tasks/:id', auth, async (req, res) => {
    let updates = Object.keys(req.body);
    let propsToUpdate = ['description', 'completed'];
    let validUpdates = updates.every((update) => propsToUpdate.includes(update));

    if (!validUpdates) {
        return res.status(400).send();
    }

    const _id = req.params.id;

    try {
        let task = await Task.findOne({
           _id,
           owner: req.user._id
        });

        if (!task) {
            return res.status(404).send();
        }

        updates.forEach((update) => {
            task[update] = req.body[update];
        });

        await task.save();

        res.send(task);
    } catch (e) {
        res.status(500).send();
    }
});

/**
 * Delete a task by id
 */
router.delete('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id;

    try {
        let task = await Task.findOne({
            _id,
            owner: req.user._id
        });

        if (!task) {
            return res.status(404).send();
        }

        task.remove();
        res.send(task);
    } catch (e) {
        res.status(500).send();
    }
});

module.exports = router;