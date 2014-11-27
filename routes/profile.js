"use strict";
var mongoose = require('mongoose'),
    users = require('../controllers/userController');

module.exports = function (app, passport) {
    app.get('/profiles/:id', users.find);
}