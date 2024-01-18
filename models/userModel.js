// Core Imports
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

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
    role: {
        type: String,
        enum: ['user', 'guide', 'lead-guide', 'admin'],
        default: 'user'
    },
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
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpres: Date
})

userSchema.pre('save', async function(next){
    if(!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    this.passwordConfirm = undefined; // Delete confirm password field
    next();
})
/* The 12 here is cost, and reflects how CPU intensive the salt/encrypt 
process will be. REMEMBER salt is adding random string */

userSchema.pre('save', async function(next){
    if(!this.isModified('password') || this.isNew) return next();
    this.passwordChangedAt = Date.now() - 1000;
    next()
}) 
/* The -1000 here offsets that saving to the DB may be slower than 
generating the JWT. This would cause the timestamp of the JWT to be before the 
password create at field, and thus the JWT would fail validation */

// This is an instance method
userSchema.methods.correctPassword = async function(
    candidatePassword, userPassword) {
    return await bcrypt.compare(candidatePassword, userPassword);
}

userSchema.methods.changedPasswordAfter = function(JWTTimestamp){
    if(this.passwordChangedAt){
        const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
        console.log(JWTTimestamp < changedTimestamp);
        return JWTTimestamp < changedTimestamp;
    }
    return false;
}

userSchema.methods.createPasswordResetToken = function(){
    const resetToken = crypto.randomBytes(32).toString('hex');
    this.passwordResetToken = 
    crypto.createHash('sha256')
    .update(resetToken)
    .digest('hex');
    this.passwordResetExpres = Date.now() + 10 * 60 * 1000;
    return resetToken;
}

const User = mongoose.model('user', userSchema);

module.exports = User;