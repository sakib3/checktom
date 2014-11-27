define(
    [
        'app',
        './views/AdminToolsView',
        './views/EditUserView'
    ],
    function(App, AdminToolsView, EditUserView) {
        var redirectFB = false;
        var AdminToolsController =Backbone.Marionette.Controller.extend({

            ShowAdminModules: function() {
                console.log('in the admintools controller');
                var layout = new AdminToolsView();
                App.vent.on("OpenEditUser", function(){
                    this.OpenEditUser();
                });
                App.content.show(layout);

            },
            OpenEditUser: function(){
                App.popup.show(new EditUserView())
            }
        });
        return new AdminToolsController();
    });

