const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = Schema({
    name: String,
    username: String,
    password: String,
    image: String,
    role: String,
    created_at: String
});
module.exports = mongoose.model('User', UserSchema);