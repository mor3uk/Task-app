const jwt      = require('jsonwebtoken');
const mongoose = require('mongoose');
const User     = require('../../src/models/user.js');
const Task     = require('../../src/models/task.js')

let userOneId = new mongoose.Types.ObjectId();
let userOne   = {
    _id: userOneId,
    name: 'Max',
    email: 'max@ex.ru',
    password: 'brhfrfcbkb',
    age: 21,
    tokens: [
        {
            token: jwt.sign({ _id: userOneId }, process.env.TOKEN_SECRET)
        }
    ]
};

let userTwoId = new mongoose.Types.ObjectId();
let userTwo   = {
    _id: userTwoId,
    name: 'Danya',
    email: 'dan@ex.ru',
    password: 'brhfrfcbkb',
    age: 21,
    tokens: [
        {
            token: jwt.sign({ _id: userTwoId }, process.env.TOKEN_SECRET)
        }
    ]
};

let taskOne = {
    _id: new mongoose.Types.ObjectId(),
    description: 'Task one',
    completed: false,
    owner: userOneId
};

let taskTwo = {
    _id: new mongoose.Types.ObjectId(),
    description: 'Task two',
    completed: true,
    owner: userOneId
};

let taskThree = {
    _id: new mongoose.Types.ObjectId(),
    description: 'Task three',
    completed: false,
    owner: userTwoId
};

const refreshDb = async () => {
    await Task.deleteMany();
    await User.deleteMany();
    await new User(userOne).save();
    await new User(userTwo).save();
    await new Task(taskOne).save();
    await new Task(taskTwo).save();
    await new Task(taskThree).save();
};

module.exports = {
    userOne,
    userOneId,
    userTwo,
    taskTwo,
    refreshDb
};