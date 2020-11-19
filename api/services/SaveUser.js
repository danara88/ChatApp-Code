'use strict';
const User = require('../models/user');
const bcrypt = require('bcrypt-nodejs');

/*
* FUNCIONALIDAD PARA COMPROBAR EL NOMBRE DE USUARIO Y ENCRIPTAR LA CONTRASEÑA
*/
exports.saveUser = async (user) => {

    // Verificar que le nombre de usuario este disponible
    user.username  = user.username.toLowerCase();
    const validateNickname = await User.find({ username: user.username }).exec().then((users) => {
        if(users.length >= 1) return false; // no es valido
        if(users.length == 0) return true; // si es valido
    }).catch(err => console.log(err));

    // Encriptar la contraseña
    let encryptPassword = null;
    if(validateNickname) {
        encryptPassword = await new Promise((resolve, reject) => {
            bcrypt.hash(user.password, null, null, (err, hash) => {
                if(err) reject(err);
                user.password = hash;
                resolve(user.password);
            })
        });
    } 


    return {
       validateNickname,
       encryptPassword
    }

}