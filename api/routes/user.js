'use strict';
const express = require('express');
const multipart = require('connect-multiparty');
const UserCtrl = require('../controllers/user');
const api = express.Router();
const authMd = require('../middlewares/auth');
const uploadMd = multipart({ uploadDir: './uploads/user' });

api.post('/user/register', UserCtrl.store);
api.post('/user/login', UserCtrl.login);
api.put('/user', authMd.auth, UserCtrl.update);
api.post('/user/image', [authMd.auth, uploadMd], UserCtrl.uploadImage);
api.get('/user/image/:imageFile', UserCtrl.getImage);
api.get('/user/search/:username', authMd.auth, UserCtrl.searchUsers);

module.exports = api;