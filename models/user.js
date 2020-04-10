const mongoose = require('mongoose');
let Schema = mongoose.Schema;

let userSchema = new Schema({
    pseudo: String,
    password: String,
    date: Date
});

module.exports = mongoose.model('User', userSchema);