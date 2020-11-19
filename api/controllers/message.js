const moment = require('moment');
const Message = require('../models/message');
const User = require('../models/user');
const HttpResp = require('../services/httpResponses');

const controller = {

    /*
    *  Crear un mensaje nuevo en un chat
    */
    saveMessage: (req, res) => {
        const params = req.body;
        const message = new Message();

        message.user = req.user.sub;
        message.chat = params.chat;
        message.text = params.text;
        message.created_at = moment().unix();

        if(message.user == null || message.chat == null || message.text == null) return HttpResp.displayCustom(res, 400, 'Imposible enviar el mensaje.');

        message.save((err, messageSaved) => {
            if(err) return HttpResp.display500Error(res);
            if(!messageSaved) return HttpResp.display400Error(res);
            
            // obtener el objeto completo del usuario
            User.findById(messageSaved.user, (err, user) => {
                if(err) return HttpResp.display500Error(res);

                delete user.password;

                return res.status(200).send({
                    message: messageSaved,
                    user
                });
            });

        });
    },

    /*
    *   OBTENER TODOS LOS MENSAJES DE UN CHAT
    */  
   getMessages: (req, res ) => {
       const chatId = req.params.chat;
       Message.find({ chat: chatId }).populate(' user ', 'name username image role').exec((err, messages) => {
        if(err) return HttpResp.display500Error(res);
        if(!messages) return HttpResp.display400Error(res);

        return res.status(200).send({ messages });
       });
   }

};

module.exports = controller;