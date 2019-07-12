const express     = require('express');
const usersRouter = require('./routers/users.js');
const tasksRouter = require('./routers/tasks.js');
require('./db/mongoose');

const app  = express();
const port = process.env.PORT;

app.use(express.json());
app.use(usersRouter);
app.use(tasksRouter);

app.listen(port, () => {
    console.log('Server is up on port ' + port);
});