/*
* This file kick starts our application
* assigns the global router to main app defined in app.js
 *
* and
* starts the app defined in app.js
 */
require(['app', 'GlobalRouter'],
    // router is now instantiated, so the module with its routes should be active
    function(App, GlobalRouter) {
        'use strict';
        App.Routers = GlobalRouter;
        App.start();
    });