'use strict';
const Chat = require('../models/chat');
const Member = require('../models/member');
const User = require('../models/user');
const Message = require('../models/message');
const moment = require('moment');
const HttpResp = require('../services/httpResponses');
const fs = require('fs');
const path = require('path');

const controller = {

    /*
    *  MÉTODO PARA CREAR UN NUEVO CHAT
    */
   store: (req, res) => {
        const userId = req.user.sub;
        const params = req.body;
        const chat = new Chat();

        chat.user = userId; // Id del usuario identificado
        chat.title = params.title;
        chat.description = params.description;
        chat.image = null;
        chat.created_at = moment().unix();

        if(chat.user != null && chat.title != null) {
            // guardar el chat
            saveChatAndMemeberAdmin(chat, res).then(value => {
                if(value.chat != null && value.member != null) {
                    return res.status(200).send({
                        chat: value.chat,
                        member: value.member
                     });
                } else {
                    return HttpResp.display400Error(res);
                }
            });
        } else {
            return HttpResp.displayCustom(res, 400, 'Faltan datos por completar.');
        }
   },


   /*
   *  OBTENER TODOS MIS CHATS
   */
   getMyChats: (req, res) => {
       const userId = req.user.sub;
       Member.find({ user: userId }).populate('chat').exec((err, members) => {
        if(err) return HttpResp.display500Error(res);
        if(!members) return HttpResp.display400Error(res);
        
        let chats = [];
        members.map((member) => {
            chats.push(member.chat);
        });
        chats.sort(function (a, b) {
            return b.created_at - a.created_at;
          });
        return res.status(200).send({ chats });
       });
   },

   /*
   *  MÉTODO PARA AÑADIR MIEMBROS
   */
  addMemeber: (req, res) => {
    const member = new Member();
    const params = req.body;
    const userId = req.user.sub;

    member.user = params.user;
    member.chat = params.chat;
    member.created_at = moment().unix();

    if(member.user == null && member.chat == null) return HttpResp.displayCustom(res, 400, 'Faltan datos.');

    // Guardar el miembro en el grupo
    Chat.findById(member.chat, (err, chat) => {
        if(chat.user != userId) return HttpResp.display403Error(res);

        member.save((err, memberStored) => {
            if(err) return HttpResp.display500Error(res);
            if(!memberStored) return HttpResp.display400Error(res);

            // obtener el objeto de usuario
            Member.findOne({ _id: memberStored._id }).populate(' user ').exec((err, member) => {
                if(err) return HttpResp.display500Error(res);
                return res.status(200).send({ member });
            });
        });
    });
    
  },

  /*
  *  QUITAR UN MIEMBRO DEL GRUPO
  */
 removeMember: (req, res) => {
     const userId = req.user.sub;
     const chatId = req.params.chatId;
     const memberId = req.params.memberId;

     // eliminar un miembro
     Chat.findById(chatId, (err, chat) => {
        if(chat.user != userId) return HttpResp.display403Error(res); // comprobar si soy admin del grupo

        Member.findByIdAndDelete(memberId, (err, memeberDeleted) => {
            if(err) return HttpResp.display500Error(res);
            if(!memeberDeleted) return HttpResp.display400Error(res);

            return res.status(200).send({ member: memeberDeleted });
        });
    });
 },

 /*
 *  MÉTODO PARA MOSTRAR TODOS LOS MIEMBROS DE UN GRUPO
 */
getMembers: (req, res) => {
    const chatId = req.params.chatId;
    const userId = req.user.sub;
   
    Member.find({ chat: chatId }).populate('user','name username image role').exec((err, members) => {
        if(err) return HttpResp.display500Error(res);
        if(!members) return HttpResp.display400Error(res);

        let isMember = false;
        members.map((member) => {
            if(member.user._id == userId) isMember = true;
        });

        if(isMember) {
            return res.status(200).send({ members });
        } else {
            return HttpResp.display403Error(res);
        }
       
    });
     
},

/*
*  SUBIR UNA IMAGEN PARA EL CHAT
*/
uploadImage: (req, res) => {
    const chatId = req.params.chatId;

    if(req.files) {
        let filePath = req.files.file0.path;
        let fileSplit = filePath.split('\\');
        let fileName = fileSplit[2];
     

        // comprobar extensiones
        let fileSplitMime = filePath.split('\.');
        let fileMime = fileSplitMime[1];
        
        if(fileMime == 'jpeg' || fileMime == 'png' || fileMime == 'jpg' || fileMime == 'gif') {

            // actualizar la imagen
            Chat.findByIdAndUpdate(chatId, {image: fileName}, {new: true}, (err, chatUpdated) => {
                if(err) return removeUpload(filePath, res, 'Error en el servidor. Vuelve a intentarlo más tarde.', 500);
                if(!chatUpdated) return removeUpload(filePath, res, 'No se ha podido encontrar el contenido solicitado.', 404);

                return res.status(200).send({ chat: chatUpdated });
            });
        } else {
            return removeUpload(filePath, res, 'Extensión de imagen no aceptada.');
        }
    } else {
        return HttpResp.displayCustom(res, 400, 'No haz seleccionado una imagen.');
    }
},

 /*
    * OBTENER LA IMAGEN DEL CHAT
    */
getImage: (req, res) => {
    const imageFile = req.params.imageFile;
    const filePath = './uploads/chat/' + imageFile;

    fs.exists(filePath, (exists) => {
        if(!exists) return HttpResp.displayCustom(res, 400, 'La imagen no existe.');
        return res.sendFile(path.resolve(filePath));
    });
},

/*
* ELIMINAR UN CHAT COMPLETO
*/
deleteChat: (req, res) => {
    const chatId = req.params.chatId;
    deleteAllRecords(chatId).then(value => {
        if(!value.messages) return HttpResp.displayCustom(res, 400, 'Los mensajes del chat no se eliminaron.');
        if(!value.members) return HttpResp.displayCustom(res, 400, 'Los miembros del chat no se eliminaron.');
        if(!value.chat) return HttpResp.displayCustom(res, 400, 'EL chat no se ha eliminado');
        if(value.messages && value.members && value.chat) return res.status(200).send({ message: 'EL chat ha sido eliminado con éxito.' });
    });
},

/*
*   OBTENER INFORMACIÓN DE UN CHAT
*/
getChat: (req, res) => {
    const chatId = req.params.chatId;
    Chat.findOne({ _id: chatId }).populate(' user ').exec((err, chat) => {
        if(err) return HttpResp.display500Error(res);
        if(!chat) return HttpResp.display404Error(res);
        return res.status(200).send({ chat });
    });
}

};

// Funciones extras

function removeUpload(filePath, res, message, code) {
    fs.unlink(filePath, (err) => {
        return HttpResp.displayCustom(res, code, message);
    });
}

async function saveChatAndMemeberAdmin(chat, res) {
    const savedChat = await new Promise((resolve, reject) => {
        chat.save((err, chatStored) => {
            if(err) reject(null);
            if(!chatStored) reject(null);
            resolve(chatStored); 
        });
    });

    const member = new Member();
    member.user = savedChat.user;
    member.chat = savedChat._id;

    const savedMember = await new Promise((resolve, reject) => {
        member.save((err, memberStored) => {
            if(err) reject(null);
            if(!memberStored) reject(null);
            resolve(memberStored);
        });
    });

    return { chat: savedChat, member: savedMember};
}

async function deleteAllRecords(id) {
    const chatId = id;

    const messagesRemoved = await Message.remove({ chat: chatId }).exec().then(messages => {
        if(messages) {
            return true;
        } else {
            return false;
        }
    }).catch(err => {
        console.log(err);
    });

    const membersRemoved = await Member.remove({ chat: chatId }).exec().then(members => {
        if(members) {
            return true;
        } else {
            return false;
        }
    }).catch(err => {
        console.log(err);
    });

    const chatRemoved = await Chat.findByIdAndDelete(chatId).exec().then(chat => {
        if(chat) {
            return true;
        } else {
            return false;
        }
    }).catch(err => {
        console.log(err);
    });

    return {
        messages: messagesRemoved,
        members: membersRemoved,
        chat: chatRemoved
    }
}

module.exports = controller;