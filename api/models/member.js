'use strict';
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MemberSchema = Schema({
    user: {type: Schema.ObjectId, ref: 'User'},
    chat: {type: Schema.ObjectId, ref: 'Chat'},
    created_at: String
});

module.exports = mongoose.model('Member', MemberSchema);