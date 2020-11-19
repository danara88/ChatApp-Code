'use strict';
const express = require('express');
const api = express.Router();
const multipart = require('connect-multiparty');
const ChatCtr = require('../controllers/chat');
const authMd = require('../middlewares/auth');
const uploadMd = multipart({ uploadDir: './uploads/chat' });
const chatMd = require('../middlewares/chat');

api.post('/chat/create', authMd.auth, ChatCtr.store);
api.post('/chat/member', authMd.auth, ChatCtr.addMemeber);
api.delete('/chat/delete-member/:chatId/:memberId', authMd.auth, ChatCtr.removeMember);
api.get('/chat/members/:chatId', authMd.auth, ChatCtr.getMembers);
api.get('/chats', authMd.auth, ChatCtr.getMyChats);
api.post('/chat/image/:chatId', [authMd.auth, chatMd.isAdminChat, uploadMd], ChatCtr.uploadImage);
api.get('/chat/image/:imageFile', ChatCtr.getImage);
api.delete('/chat/:chatId', [authMd.auth, chatMd.isAdminChat], ChatCtr.deleteChat);
api.get('/chat/:chatId', [authMd.auth], ChatCtr.getChat);

module.exports = api;   