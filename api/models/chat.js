const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ChatSchema = Schema({
    user: {type: Schema.ObjectId, ref: 'User'},
    title: String,
    description: String,
    image: String,
    created_at: String
});
module.exports = mongoose.model('Chat', ChatSchema);