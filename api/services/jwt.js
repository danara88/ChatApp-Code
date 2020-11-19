'use strict';
const jwt = require('jwt-simple');
const moment = require('moment');
const secret = 'secretsecret1234';

exports.createToken = (user) => {
    let payload = {
        sub: user._id,
        name: user.name,
        username: user.username,
        role: user.role,
        iat: moment().unix,
        exp: moment().add(3, 'days').unix()
    }

    let token = jwt.encode(payload, secret);
    return token;
}
