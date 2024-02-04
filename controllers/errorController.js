// Custom Imports
const AppError = require('./../utils/appError');

const handleDbCastError = err => {
    const message = `Invalid error ${err.path}: ${err.value}`;
    return new AppError(message, 400);
}

const handleDbDuplicate = err => {
    const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
    const message = `Duplicate field value for: ${value}, please use another value.`;
    return new AppError(message, 400);
}

const handleDbValidation = err => {
    const errors = Object.values(err.errors).map(el => el.message);
    const message = `Invalid input data: ${errors.join(' ')}`;
    return new AppError(message, 400);
}

const handleJWTError = () => new AppError('Invalid token. Please log in again!', 401);

const handleJWTExpiredError = () => new AppError('Your token has expired! Please log in again.', 401);

const devError = (req, res, err) => {
    // API error
    if(req.originalUrl.startsWith('/api')){
        res.status(err.statusCode).json({
            status: err.status,
            error: err,
            message: err.message,
            stack: err.stack
        })
    // Rendered page error
    } else {
        res.status(err.statusCode).render('error', {
            title: 'Something went wrong',
            msg: err.message
        })
    }
};

const prodError = (req, res, err) => {
    if(req.originalUrl.startsWith('/api')) {
        if (err.isOperational) {
            return res.status(err.statusCode).json({
                status: err.status,
                message: err.message
            });
        }
        console.error('ERROR 💥', err);
        return res.status(500).json({
            status: 'error',
            message: 'Something went very wrong!'
        });
    }
    if (err.isOperational) {
        console.log(err);
        return res.status(err.statusCode).render('error', {
            title: 'Something went wrong!',
            msg: err.message
        });
    }
    console.error('ERROR 💥', err);
    return res.status(err.statusCode).render('error', {
        title: 'Something went wrong!',
        msg: 'Please try again later.'
    });
};

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';
    if(process.env.NODE_ENV === 'development'){
        devError(req, res, err);
    } else {
        let error = Object.assign(err);
        if(error.name === 'CastError') error = handleDbCastError(error);
        if(error.code === 11000) error = handleDbDuplicate(error);
        if(error.name === 'ValidationError') error = handleDbValidation(error);
        if(error.name === 'JsonWebTokenError') error = handleJWTError();
        if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();
        prodError(req, res, err);
    }
};
// Don't forget most everything in here is an object