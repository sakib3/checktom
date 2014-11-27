define([
    'app',
    './StreamController',
    'backbone',
    'marionette'
], function (App, StreamController, Backbone) {
    'use strict';

    App.module("StreamPage", function (Stream, App, Backbone) {
        this.on("start", function () {
            console.log('started Stream module');
            StreamController.GoToStream();
        });
        var router = App.Routers;
        console.log(router);
        App.Routers.processAppRoutes(StreamController, {
            'stream':'GoToStream'
        });
        App.addInitializer(function () {

        });
        //return App.Router;
    });
    return App.StreamPage;
});