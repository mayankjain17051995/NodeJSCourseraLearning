const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const PassportLocalMongoose = require('passport-local-mongoose');

var User = new Schema({
    firstname: {
        type: String,
        default: ''
    },
    lastname: {
        type: String,
        default: ''
    },
    admin: {
        type: Boolean,
        default: false
    }
});

User.plugin(PassportLocalMongoose);

module.exports = mongoose.model('User', User);