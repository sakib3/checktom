define([
    'app',
    './AuthController'], function(App, AuthController) {
    'use strict';
    App.module("Auth", function(Auth, App) {
        //this.startWithParent = false;
        var Router = Backbone.Marionette.AppRouter.extend({
            initialize: function(options) {},
            controller: new AuthController({}),
            appRoutes: {
                "signup": "signup",
                //"": "login",
                "login": "login",
                "login/:id":"loginRedirectedByItemLink",
                "signup/:id":"signupRedirectedByItemLink",
                "recoverPassword":"recoverPassword",
                "resetPassword/:id":"SendPWEmail"
            }
        });
        this.on('start', function() {
            // Start the router
            new Router({});
        });
    });
    return App.Auth;
});