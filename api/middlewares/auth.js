'use strict';
const jwt = require('jwt-simple');
const moment = require('moment');
const secret = 'secretsecret1234';
const HttpResp =require('../services/httpResponses'); 

exports.auth = (req, res, next) => {
    if(!req.headers.authorization) return HttpResp.display403Error(res);
    let token = req.headers.authorization.replace(/['"]+/g,'');

    try {
        var payload = jwt.decode(token, secret);
        if(payload.exp <= moment().unix()) return HttpResp.displayCustom(res, 400, 'Token de autenticación expirado.');
    } catch(ex) {
        return res.status(403).send({ message: 'Token de autenticación invalido.' });
    }
    req.user = payload;
    next();
}