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

const devError = (err, res) => {
    res.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack
    })
};

const prodError = (err, res) => {
    if(err.isOperational){
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message
        })
    } else {
        console.error(`Error: ${err}`); // I want to use a proper logger here
        res.status(500).json({
            status: 'error',
            message: 'Something went wrong here...'
        })
    }
};

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';
    if(process.env.NODE_ENV === 'development'){
        devError(err, res);
    } else {
        // let error = { ... err };
        /* I'm not sure, but I think the above mutation also mutated the err clone 
        object, which in tern caused err.name to be lost */ 
        let error = Object.assign(err);
        if(error.name === 'CastError') error = handleDbCastError(error);
        if(error.code === 11000) error = handleDbDuplicate(error);
        if(error.name === 'ValidationError') error = handleDbValidation(error);
        if(error.name === 'JsonWebTokenError') error = handleJWTError();
        if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();
        prodError(error, res); 
    }
};
// Don't forget most everything in here is an object