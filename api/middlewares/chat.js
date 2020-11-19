const Chat = require('../models/chat');
const Member = require('../models/member');
const Httpresp = require('../services/httpResponses');

/*
* VERIFICAR QUE ERES ADMIN DEL CHAT
*/
exports.isAdminChat = (req, res, next) => {
    const chatId = req.params.chatId;
    Chat.findById(chatId, (err, chat) => {
        if(err) return Httpresp.display500Error(res);
        if(!chat) return Httpresp.display404Error(res);

        if(chat.user != req.user.sub) return Httpresp.display403Error(res);

        next();
    });
}

/*
*   VERIFICAR QUE SEA MIEMBRO DEL CHAT
*/
exports.isMemberChat = (req, res, next) => {
    let chatId = req.body.chat;
    if(req.params.chat) {
        chatId = req.params.chat;
    }
    const pipe = { '$and': [{'chat': chatId},{user: req.user.sub}] };
    Member.findOne(pipe, (err, member) => {
        if(err) return Httpresp.display500Error(res);
        if(!member) return Httpresp.display403Error(res);
        next();
    });
}