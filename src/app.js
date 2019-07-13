const express     = require('express');
const usersRouter = require('./routers/users.js');
const tasksRouter = require('./routers/tasks.js');
require('./db/mongoose');

const app = express();

app.use(express.json());
app.use(usersRouter);
app.use(tasksRouter);

module.exports = app;