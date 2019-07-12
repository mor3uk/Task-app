const mongoose  = require('mongoose');
const validator = require('validator');
const bcrypt    = require('bcryptjs');
const jwt       = require('jsonwebtoken');
const Task      = require('./task.js');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        validate (email) {
            if (!validator.isEmail(email)) {
                throw new Error('Invalid Email');
            }
        }
    },
    age: {
        type: Number,
        default: 18,
        validate(age) {
            if (age < 0) {
                throw new Error('Age must be a positive number');
            }
        }
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minlength: 6,
        validate(password) {
            if (password.toLowerCase() == 'password') {
                throw new Error('Password cannot equal to "password"');
            }
        }
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    avatar: {
        type: Buffer
    }
}, {
    timestamps: true
});

/**
 * Generate token
 */
userSchema.methods.generateAuthToken = async function () {
    let user = this;

    let token = jwt.sign({ id: user.id.toString() }, process.env.TOKEN_SECRET);
    user.tokens = user.tokens.concat({ token });
    await user.save();

    return token;

};

/**
 * Use this method to clean the data
 */
userSchema.methods.toJSON = function () {
    let user = this.toObject();

    delete user.tokens;
    delete user.password;
    delete user.avatar;

    return user;    
};

/**
 * Log user
 */
userSchema.statics.findByCredentials = async (email, password) => {
    let user = await User.findOne({ email });

    if (!user) {
        throw new Error('Unable to log in');
    }

    let isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
        throw new Error('Unable to log in');
    }

    return user;
};

/**
 * Hash user password
 */
userSchema.pre('save', async function (next) {
    let user = this;

    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8);
    }

    next();
});

/**
 * Delete the removed user's tasks
 */
userSchema.pre('remove', async function (next) {
    let user = this;

    await Task.deleteMany({
        owner: user._id
    });

    next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;