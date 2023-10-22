const User = require('../model/user');
const {validationResult } =  require('express-validator');
const bcrypt = require('bcryptjs');
exports.signup = (req , res, next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty){
        const error = new Error('Validation failed');
        error.statusCode = 422;
        error.date = errors.array();
        throw error
    }
    const email = req.body.email;
    const name = req.body.name;
    const password = req.body.password;
    bcrypt.hash(password , 12).then(hashedPassword => {
        const user = new User({
            email: email,
            name: name,
            password: hashedPassword
        });
        return user.save()
    }).then(result => {
        res.status(201).json({
            message: 'User created successfully',
            userId: result._id
        })
    })
    .catch(err => {
        if(!err.statusCode){
            err.statusCode = 500;
        }
        next(err)
    });
    
}