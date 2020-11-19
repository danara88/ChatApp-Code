const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MessageSchema = Schema({
    user: {type: Schema.ObjectId, ref: 'User'},
    chat: {type: Schema.ObjectId, ref: 'Chat'},
    text: String,
    created_at: String
});
module.exports = mongoose.model('Message', MessageSchema);