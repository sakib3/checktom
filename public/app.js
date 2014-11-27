define([
    "backbone",
    "marionette"
],
    function(Backbone) {
        'use strict';
        // Create the application
        var App = new Backbone.Marionette.Application();
        App.root = '../public/';
        // Initializer which preloads the view.
        App.addInitializer(function(options) {

        });

        // alternative to our backbones app initialization.
        App.addRegions({
            content: "#content",
            popup: "#popup"
        });
        App.on('initialize:after', function() {
            Backbone.history.start();
        });
        console.log('app is started');
        return App;
    });
