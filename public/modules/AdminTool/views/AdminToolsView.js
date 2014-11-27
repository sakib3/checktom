define(
    [
        'app',
        'jade!../templates/AdminToolsTemplate',
        'models/GetUsersModel',
        './EditUserView',
        'backbone',
        'backbone_validation'//,
        //'facebook'
    ],
    function (App,AdminToolsTemplate, GetUsersModel,EditUserView, Backbone) {
        var AdminToolsView = Backbone.Marionette.Layout.extend({
            requireLogin: true,
            template: function() {
                console.log('trying to render admintoolstemplate');
                var that = this;
                return _.template(AdminToolsTemplate());
            },
            initialize: function (options) {
                this.options = options || {};

            },
            events: {
                "click #AdmToolModule1": "EditUser"  // example {"submit #AnForm" : "postform"}
            },
            EditUser: function (event) {
                event.preventDefault();
                App.popup.show(new EditUserView());
            }

        });

        return AdminToolsView;
    });
