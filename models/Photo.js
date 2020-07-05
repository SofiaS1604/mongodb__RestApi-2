const {Schema, model} = require('mongoose');

const Photo = new Schema({
    name: {
        type: String,
        required: true
    },
    url: {
      type: String,
      required: true
    },
    tags: {
        type: String,
    },
    owner_id: {
        type: String,
        required: true
    }
}, {versionKey: '_somethingElse'});

module.exports = model('Photo', Photo);