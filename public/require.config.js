require.config({
    // looks for main.js and kickstart our app
    deps: ['starter'],
    paths: {
        // libraries
        underscore: '/assets/libs/underscore/underscore-min',

        backbone: '/assets/libs/backbone/backbone-min',
        backbone_super: '/assets/libs/backbone/backbone-super',
        backbone_validation: '/assets/libs/backbone/backbone-validation-amd-min',

        wreqr: '/assets/libs/backbone/backbone.wreqr.min',

        marionette: '/assets/libs/backbone/backbone.marionette.min',
        marionetteSubrouter:'/assets/libs/backbone/backbone.marionette.subrouter',

        handlebars: '/assets/libs/handlebars/handlebars.min',
        bootstrap: '/assets/libs/bootstrap/bootstrap.min',
        bootstrapSelect: '/assets/libs/bootstrap/bootstrap-select',
        bootstrapSwitch: '/assets/libs/bootstrap/bootstrap-switch',

        flatuiCheckbox: '/assets/libs/flatui/js/flatui-checkbox',
        flatuiRadio: '/assets/libs/flatui/js/flatui-radio',
        flatuiTags: '/assets/libs/flatui/js/jquery.tagsinput',
        flatuiplaceholder: '/assets/libs/flatui/js/jquery.placeholder',
        flatuiApp: '/assets/libs/flatui/js/application',
        flatuiSwitch: '/assets/libs/switch-master/bootstrap-switch.min',

        socketio: './socket.io/socket.io',
        jade: '/assets/libs/jade/jade',
        woomark: '/assets/libs/woomark/jquery.wookmark',

        jquery: '/assets/libs/flatui/js/jquery-1.8.3.min',//'/assets/libs/jquery/jquery.min',
        jqueryUI: '/assets/libs/flatui/js/jquery-ui-1.10.3.custom.min',
        jqueryTouch:'/assets/libs/flatui/js/jquery.ui.touch-punch.min',
        jqueryScrollTo:'/assets/libs/jquery/jquery.scrollTo.min',

        masonry: '/assets/libs/jquery/masonry.min',
        imagesloaded: '/assets/libs/jquery/imagesloaded.min',
        babysitter: '/assets/libs/backbone/backbone.babysitter.min',
        facebook : '//connect.facebook.net/en_US/all',
        growl: '/assets/libs/growl/bootstrap-growl.min',

        // models
        models: '/models',
        // main app
        app: 'app'
    },
    shim: {

        // backbone related shims
        backbone: {
            deps: ['underscore', 'jquery'],
            exports: 'Backbone'
        },
        backbone_super: {
            deps: ['backbone']
        },
        backbone_validation: {
            deps: ['backbone']
        },
        marionette: {
            deps: ['backbone', 'wreqr', 'babysitter'],
            exports: 'Backbone.Marionette'
        },
        marionetteSubrouter:{
            desp:['marionette'],
            exports: 'Backbone.Marionette.SubRoute'
        },
        // templating underscore and handlebars
        underscore: {
            exports: '_'
        },
        handlebars: {
            exports: 'Handlebars'
        },
        // bootstrap and jquery related libraries
        bootstrap: {
            deps: ['jqueryUI', 'jquery']
        },
        jqueryUI: {
            deps: ['jquery']
        },
        masonry: {
            deps: ['jquery'],
            exports: 'masonry'
        },
        imagesloaded: {
            deps: ['jquery'],
            exports: 'imagesloaded'
        },

        // main app depends on Marionette, backbone, jquery and underscore
        app: {
            deps: ['marionette']
        }
    }
});