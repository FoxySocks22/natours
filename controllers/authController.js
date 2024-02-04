// Core Imports
const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');

// Custom Imports
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const sendMail = require('./../utils/email');

// Methods 
const signToken = id => {
    return jwt.sign({ id }, process.env.JWT_SECRET, 
        { expiresIn: process.env.JWT_EXPIRES_IN });
};

const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);
    const cookieOptions = {
        expires: new Date(
            Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
        ),
        httpOnly: true
    }// 24 * 60 * 60 * 1000 is milisecond conversion
    if(process.env.NODE_ENV === 'production') cookieOptions.secure = true;
    user.password = undefined; // Remove password from response data 
    res.cookie('jwt', token, cookieOptions )
    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user
        }
    })
}

exports.signup = catchAsync(async(req, res, next) => {
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        // role: req.body.role,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm
        // passwordChangedAt: req.body.passwordChangedAt
    });
    createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async(req, res, next) => {
    const { email, password } = req.body; // This works as the desired property matches the variable name
    if(!email || !password) {
        return next(new AppError('Please provide email and password', 400));
    }
    const user = await User.findOne({ email }).select('+password'); // Selects password as it was removed from find/select in the model
    if(!user || !await user.correctPassword(password, user.password)){
        return next(new AppError('Email or password was incorrect.', 401));
    }
    createSendToken(user, 200, res);
});

exports.logout = (req, res) => {
    res.cookie('jwt', 'loggedOut', {
        expires: new Date(Date.now() + 500),
        httpOnly: true
    })
    res.status(200).json({
        status: 'success'
    })
}

exports.protect = catchAsync(async(req, res, next) => {
    let token;
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.jwt) {
        token = req.cookies.jwt
    }
    if(!token){
        return next(new AppError('You are not logged in.', 401));
    }
    const decode = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    const currentUser = await User.findById(decode.id);
    if(!currentUser) return next(new AppError('This user no longer exists', 401));
    if(currentUser.changedPasswordAfter(decode.iat)){
        return next(new AppError('Your password was recently changed, please login again.', 401));
    }
    req.user = currentUser;
    res.locals.user = currentUser;
    next();
}) 

// Only for rendered pages, and will never throw any errors
exports.isLoggedIn = async(req, res, next) => {
    try {
        if(req.cookies.jwt) {
            const decode = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);
            const currentUser = await User.findById(decode.id);
            if(!currentUser) return next();
            if(currentUser.changedPasswordAfter(decode.iat)){
                return next();
            }
            // This makes the data available to template files
            res.locals.user = currentUser;
            return next();
        }
    } catch(err) {
        return next();
    }
    next();
}

exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        console.log(roles, req.user.role);
        if(!roles.includes(req.user.role)){
            return next(new AppError('You do not have permission to perform this action', 403));
        }
        next();
    }
} // roles in an array. The above is also an example of a closure

exports.forgotPassword = catchAsync(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email });
    if(!user){
        return next(new AppError('user not found', 404));
    } 
    const resetToken = user.createPasswordResetToken();
     await user.save({ validateBeforeSave: false }); // this deactivates model validators
    const restUrl = 
    `${req.protocol}://${req.get('host')}/api/v1/users/reset-password/${resetToken}`;
    const message = `Reset your password by navigating to this link: ${restUrl}\nIf you did not request this email, please delete it immeditaley.`;
    try {
        await sendMail({
            email: user.email,
            subject: 'Password reset',
            message: message
        })
        res.status(200).json({
            status: 'success',
            message: 'Reset link and token sent.'
        }) // This creates an error, but if removed nothing works...
    } catch (err) {
        console.log(err);
        user.passwordResetToken = undefined;
        user.passwordResetExpres = undefined;
        await user.save({ validateBeforeSave: false });
        return next(new AppError(
            'There was a problem sending the email, please try again', 500));
    }
    next();
})

exports.resetPassword = catchAsync(async(req, res, next) => {
    const hashedToken = 
    crypto.createHash('sha256')
        .update(req.params.token)
        .digest('hex') // Refactor into standalone method
    const user = await User.findOne({ 
        passwordResetToken: hashedToken,
        passwordResetExpres: { $gt: Date.now() }
     });
     if(!user){
        return next(
            new AppError('Token is either invalid or expired.', 400)
            );
     }
     user.password = req.body.password;
     user.passwordConfirm = req.body.passwordConfirm;
     user.passwordResetExpres = undefined;
     user.passwordResetToken = undefined;
     await user.save();
     createSendToken(user, 200, res);
    next();
})

exports.updatePassword = catchAsync(async(req, res, next) => {
    const user = await User.findById(req.user.id).select('+password');
    if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
        return next(new AppError('The passwords do not match',401));
    }
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save();
    createSendToken(user, 200, res);
    next();
})

/* Notes 

The req.user = currentUser above  allows data, user in this case to be passed 
to the next middleware.
The password changed was complicated 
The password can not have been changed prior to the issuence of the token
To debug & inspect JSON web tokens, go here: https://jwt.io/
To generate secret keys, go here: https://djecrety.ir/

*/