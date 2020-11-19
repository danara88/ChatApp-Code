'use strict';
const mongoose = require('mongoose');
const app = require('./app');
const port = process.env.PORT || 3000;

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/elchat_db')
    .then(() => {
        console.log('>> Connected to database');

        app.listen(port, () => {
            console.log('>> Port listening at: http://localhost:3000');
        });
    }).catch( err => {  
        console.log(err);
    });