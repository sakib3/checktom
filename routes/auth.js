"use strict";
var mongoose = require('mongoose'),
    passport = require('passport'),
    users = require('../controllers/userController');

module.exports = function (app, passport) {
    app.put('/changePassword/:id',users.resetPassword);

    // Index page
    app.get('/', users.index);

    // checks if the user is already loggedin
    app.get('/isLoggedIn', users.isLoggedIn);

    // checks if a user is the owner of an article
    app.post('/verifyOwnership', users.verifyOwnership);
    //
    app.post('/updateUser', users.updateUser);
    // edituserinfo - from editprofile view
    app.post('/editUserInfo', users.EditUserInfo);

    // creates user with post data
    app.post('/users', users.create);

    // Passport authentication for local user i.e. signedup via email
    app.post('/users/session', function (req, res, next) {
        passport.authenticate('local', function (err, user, info) {
            if (err) {
                //res.send(next(err));
                console.log(err);
                res.send(false);
            } else {


                req.logIn(user, function (err) {
                    if (err) {
                        console.log(err);
                        res.send(false);
                    } else {
                        req.session.loggedIn = true;
                        console.log("user");
                        console.log(user._id);
                        req.session.userId = user._id;
                        res.redirect(200);
                    }
                });
            }
        })(req, res, next);
    });

    // logging out
    app.get('/logout', users.logout);

    // Resetting password

    // Passport authentication for facebook login
    app.get('/auth/facebook', function (req, res, next) {
        console.log("facebook auth route prompted");
        res.setHeader('Access-Control-Allow-Origin', '*');
        passport.authenticate('facebook', {
            scope:['public_profile','user_friends','email'],
            failureRedirect: '/',
            display: 'touch'
        })(req, res, next);
    });

    app.get('/auth/facebook/callback', passport.authenticate('facebook', {
        failureRedirect: '/'
    }), users.authCallback);
    app.get('/GetAuthorData/:id',users.getAuthorFBID);
}