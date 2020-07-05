const {Schema, model} = require('mongoose');

const Share = new Schema({
    user_id: {
        type: String,
        required: true
    },
    photo_id: {
        type: String,
        required: true
    }
});

module.exports = model('Share', Share);