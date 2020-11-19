/*
*
* Funciones para mostrar mensajes de códigos de error http
*  500, 400, 404, 403, custom
*/
exports.display500Error = function(res){
    res.status(500).send({message: 'Error en el servidor. Vuelve a intentarlo más tarde.'});
}

exports.display404Error = function(res){
    res.status(404).send({message: 'No se ha podido encontrar el contenido solicitado.'});
}

exports.display400Error = function(res){
    res.status(400).send({message: 'No se ha podido interpretar la solicitud.'});
}

exports.displayCustom = function(res, status, message){
    res.status(status).send({message});
}

exports.display403Error = function(res){
    res.status(403).send({message: 'Permiso denegado. No tienes permitido ejecutar esta área.'});
}