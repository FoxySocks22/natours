// Core Imports
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a name.']
    },
    email: {
        type: String,
        required: [true, 'Please provide an email address.'],
        unique: true,
        lowercase: true,
        validator: [validator.isEmail, 'Please provide a valid email address.']
    },
    photo: String,
    password: {
        type: String,
        required: [true, 'Please provide a password.'],
        minLength: 8,
        select: false
    },
    passwordConfirm: {
        type: String,
        required: [true, 'Please confirm your password.'],
        // This only works on save & create
        validate: {
            validator: function(elm){
                return elm === this.password;
            },
            message: 'This does not match password.'
        }
    }
})

userSchema.pre('save', async function(next){
    if(!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    this.passwordConfirm = undefined; // Delete confirm password field
    next();
})
/* The 12 here is cost, and reflects how CPU intensive the salt/encrypt 
process will be. REMEMBER salt is adding random string */

// This is an instance method
userSchema.methods.correctPassword = async function(
    candidatePassword, userPassword) {
    return await bcrypt.compare(candidatePassword, userPassword);
}

const User = mongoose.model('user', userSchema);

module.exports = User;