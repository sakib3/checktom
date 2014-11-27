"use strict";
var mongoose = require('mongoose'),
    mailService = require('../controllers/mailController');

module.exports = function (app, passport) {
    app.get('/verify/:key', mailService.VerifyLink);
    app.put('/recoverMail', mailService.SendRecoverPassword);
}