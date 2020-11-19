'use strict';
const User = require('../models/user');
const moment = require('moment');
const bcrypt = require('bcrypt-nodejs');
const jwtService = require('../services/jwt');
const saveUserService = require('../services/SaveUser');

const HttpResp =require('../services/httpResponses'); // Servicio para las respuestas http
const path = require('path');
const fs = require('fs');
const { rawListeners } = require('../models/user');

const controller = {

    /*
    * MÉTODO PARA GUARDAR UN USUARIO EN LA BASE DE DATOS
    */
    store: (req, res) => {
        let params = req.body;
        const user = new User();

        user.name     = params.name;
        user.username = params.username;
        user.password = params.password;
        user.role     = 'ROLE_USER';
        user.image    = null;
        user.created_at = moment().unix();

        if( user.name != null && user.username != null && user.password != null) {
            user.username = user.username.toLowerCase();
            saveUserService.saveUser(user).then( value => {
                console.log(value);
                if(!value.validateNickname) return HttpResp.displayCustom(res, 400, user.username + ' ya esta en uso.');
                if(value.validateNickname && value.encryptPassword !== null) {
                        // guardar el nuevo usuario en la base de datos
                        user.save((err, userStored) => {
                            if(err) return HttpResp.display500Error(res);
                            if(!userStored) return HttpResp.displayCustom(res, 400, 'Registro fallido.');

                            return res.status(200).send({ user: userStored });
                        });
                }
            });
        } else {
            return HttpResp.displayCustom(res, 400, 'Ingresa los datos solicitados.');
        }
        
    },

    /*
    * MÉTODO PARA IDENTIFICACIÓN DEL USUARIO
    */
    login: (req, res) => {
        let params = req.body;
        let username = params.username;
        let password = params.password;
        if(username != null) username =  username.toLowerCase();
        // Encontrar el registro por el nombre de usuario
        User.findOne({ username: username }, (err, user) => {
            if(err) return HttpResp.display500Error(res);
            if(!user) return HttpResp.displayCustom(res, 400, 'Nombre de usuario o contraseña incorrectos');

            // Comparar las contraseñas
            bcrypt.compare(password, user.password, (err, check) => {
                if(check) {
                    if(params.getToken) {
                        // devuelvo el token
                        return res.status(200).send({ token: jwtService.createToken(user) });
                    } else {
                        // devuelvo el usuario
                        user.passoword = undefined;
                        return res.status(200).send({ user });
                    }
                } else {
                    return HttpResp.displayCustom(res, 400, 'Nombre de usuario o contraseña incorrectos.');
                }
            });

        });
    },

    /*
    * METODO PARA ACTUALIZAR DATOS GENERALES DEL USUARIO
    */
    update: (req, res) => {
        const userId = req.user.sub;
        const update = req.body;
        delete update.password;
        
        if(update.username != req.user.username) {
            // checar la disponibilidad del nombre de usuario
            checkRepeatedUsername(update, req).then( value => {
                if(value.repeatedUser) return HttpResp.displayCustom(res, 400, update.username + ' ya esta en uso.');
                
                // Actualizar el usuario
                User.findByIdAndUpdate(userId, update, {new: true}, (err, userUpdated) => {
                    if(err) return HttpResp.display500Error(res);
                    if(!userUpdated) return HttpResp.display404Error(res);
                    return res.status(200).send({user: userUpdated});
                });
            });
        } else {
            User.findByIdAndUpdate(userId, update, {new: true}, (err, userUpdated) => {
                if(err) return HttpResp.display500Error(res);
                if(!userUpdated) return HttpResp.display404Error(res);
                return res.status(200).send({user: userUpdated});
            });
        }
    },

    /*
    *  MÉTODO PARA OBTENER USUARIOS
    */
    searchUsers: (req, res) => {
        const username = req.params.username;
        
        User.find({ username: username }, (err, users) => {
            if(err) return HttpResp.display500Error(res);
            if(!users) return HttpResp.display404Error(res);

            return res.status(200).send({ users });
        });
    },

    /*
    * MÉTODO PARA SUBIR UN AVATAR PARA EL USUARIO
    */
    uploadImage: (req, res) => {
        const userId = req.user.sub;
        if(req.files) {
            const img_path = req.files.file0.path;
            const path_split = img_path.split('\\');
            const file_name = path_split[2];
            
            const ext_split = img_path.split('\.');
            const ext = ext_split[1];
            if(ext === 'jpg' || ext === 'png' || ext === 'gif' || ext == 'jpeg') {
                User.findByIdAndUpdate(userId, {image: file_name}, { new: true }, (err, userUpdated) => {
                    if(err) return removeUpload(img_path, 'Error en el servidor.',res, 500);
                    if(!userUpdated) return removeUpload(img_path, 'Algo salió mal. Vuelve a intentarlo más tarde.', res, 400);
                    return res.status(200).send({ user: userUpdated, image: file_name });
                });
            } else {
                return removeUpload(img_path, 'Extensión de imagen no valida.', res, 400);
            }
        } else {
            return HttpResp.displayCustom(res, 400, 'No se ha seleccionado una imagen.');
        }
    },

    /*
    * MÉTODO PARA OBTENER EL AVATAR DEL USUARIO
    */
    getImage: (req, res) => {
        const imageFile = req.params.imageFile;
        const filePath = `./uploads/user/${imageFile}`;
        fs.exists(filePath, (exists) => {
            if(!exists) return HttpResp.displayCustom(res, 400, 'La imagen no existe.');

            return res.sendFile(path.resolve(filePath));
        });
    }

};


function removeUpload(pathFile, message, res, code) {
    fs.unlink(pathFile, (err) => {
        if(err) HttpResp.display500Error(res);
        return HttpResp.displayCustom(res, code, message);
    });
}

async function checkRepeatedUsername(user, req) {
    const repeatedUser = await User.find({ username: user.username }).exec().then((users) => {
        let users_repeated = [];
        users.forEach((user) => {
            if(user._id != req.user.sub){
                users_repeated.push(user._id);
            }
        });
        if(users_repeated.length >= 1) return true; // El nombre de usuario ya esta en uso
        if(users_repeated.length < 1) return false; // El nombre de usuario esta disponibleo
    }).catch( err => console.log(err));
    return {
        repeatedUser
    }
}

module.exports = controller;