'use strict';
const express = require('express');
const api = express.Router();
const MessageCtr = require('../controllers/message');
const authMd = require('../middlewares/auth');
const chatMd = require('../middlewares/chat');

api.post('/message/save', [authMd.auth, chatMd.isMemberChat], MessageCtr.saveMessage);
api.get('/messages/:chat', [authMd.auth, chatMd.isMemberChat], MessageCtr.getMessages);

module.exports = api;