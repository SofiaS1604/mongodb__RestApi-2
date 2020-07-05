const {Schema, model} = require('mongoose');

const User = new Schema({
    first_name: {
        type: String,
        required: true,
    },
    surname: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
        unique: true,
        minlength: 11,
        maxlength: 11
    },
    password: {
        type: String,
        required: true,
    },
    token: {
        type: String,
        required: true,
        default: '-1'
    },
}, {versionKey: '_somethingElse'});

module.exports = model('User', User);