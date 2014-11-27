define([
    'app',
    './AdminToolsController',
    'backbone',
    'marionette'
], function (App, AdminToolsController, Backbone) {
    'use strict';

    App.module("AdminTools", function (AdminTools, App, Backbone) {
        this.on("start", function () {
            console.log('started admin module');
            AdminToolsController.ShowAdminModules(); // This would take you to the index page when directed here.
        });
        var router = App.Routers;
        console.log(router);
        App.Routers.processAppRoutes(AdminToolsController, {
               'AdminTools/EditUserModule' : "OpenEditUser",
               'AdminTools': "ShowAdminModules"
        });
        App.addInitializer(function () {

        });
        //return App.Router;
    });
    return App.AdminTools;
});