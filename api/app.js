'use strict';

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 3000;

// configuración del socket.io
const server = require('http').createServer(app);
const io = require('socket.io')(server);

io.on('connection', (socket) => {
   
    socket.on('saveMessage', (data) => {
        io.emit('sendMessage', {user: data.user, message: data.message});
    });

});


// CREACIÓN DEL SERVIDOR Y CONEXIÓN A BASE DE DATOS
mongoose.Promise = global.Promise;
mongoose.connect('mongodb+srv://Daniel:daniel1234@cluster0.pwc33.mongodb.net/app-chat?retryWrites=true&w=majority')
    .then(() => {
        console.log('>> Connected to database');

        server.listen(port, () => {
            console.log('>> Port listening at: http://localhost:3000');
        });
    }).catch( err => {  
        console.log(err);
    });



// REQUERIR LAS RUTAS DEL API
const userRoutes = require('./routes/user');
const chatRoutes = require('./routes/chat');
const messageRoutes = require('./routes/message');

// CONFIGURAR BODYPARSER
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// CORS PARA ECITAR ERRORES DE CONEXION CRUZADA
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
    next();
});

//  MIDDLEWARES PARA LAS RUTAS DEL API
app.use('/api', userRoutes);
app.use('/api', chatRoutes);
app.use('/api', messageRoutes);

// EXPORTAR APP
module.exports = app;
