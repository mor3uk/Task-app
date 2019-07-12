const mongoose = require('mongoose');

mongoose.connect(process.env.DB_PATH, {
    useNewUrlParser: true,
    useCreateIndex: true
});