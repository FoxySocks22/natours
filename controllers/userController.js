// Custom Imports
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const factory = require('./handleFactory');
const multer = require('multer');
const sharp = require('sharp');

// Image upload & proccessing
const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
    file.mimetype.startsWith('image') 
    ? cb(null, true) 
    : cb(new AppError('Not an image file.', 400), false);
}

const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter
});

exports.uploadUserPhoto = upload.single('photo');

exports.resizeUserPhoto = catchAsync(async(req, res, next) => {
    if(!req.file) return next();
    req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg}`
    await sharp(req.file.buffer)
        .resize(500, 500)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/users/${req.file.filename}`);
        next();
})

/* Sharpe is resizing the image from the req object.
The image is also stored in memory, which is why it is accessed from buffer. */

// Methods 
const filterObj = (obj, ...allowedFields) => {
    const newObj = {};
    Object.keys(obj).forEach(el => {
        if(allowedFields.includes(el)) newObj[el] = obj[el];
    })
    return newObj;
}

exports.getMe = (req, res, next) => {
    req.params.id = req.user.id;
    next();
} // This replaces url param with logged in user id

exports.updateMe = catchAsync(async(req, res, next) => {
    if(req.body.password || req.body.passwordConfirm){
        return next(new AppError('You can not change your password here.', 400));
    }
    const filterBody = filterObj(req.body, 'name', 'email');
    if(req.file) filterBody.photo = req.file.filename;
    const updatedUser = await User.findByIdAndUpdate(
        req.user.id, filterBody, {
            new: true,
            runValidators: true
        });
    res.status(200).json({
        status: 'success',
        date: {
            user: updatedUser
        }
    })
}) // What about unique email address??

/* findByIdAndUpdate works here as unlike working with passwords we don't need
all the validators to run and nothing is sensetive, so we can use this method */

exports.deleteMe = catchAsync(async(req, res, next) => {
    await User.findByIdAndUpdate(req.user.id, {active: false });
    res.status(204).json({
        status: 'success',
        data: null
    })
})

exports.createUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This route is not yet define'
    })
}

exports.getUser = factory.getOne(User);
exports.getAllUsers = factory.getAll(User);
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);