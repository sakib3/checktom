define(
    ['app',
        'jade!../templates/LoginTemplate',
        'backbone', 'backbone_validation'],
    function (App, LoginTemplate) {
        var loginView = Backbone.Marionette.Layout.extend({
            requireLogin: true,
            //el: $('#content'),
            template: function () {
                var that = this;
                return _.template(LoginTemplate());
            },
            initialize: function (options) {
                this.options=options||{};
            },
            events: {
                'submit #LoginForm': 'onSubmit',
                'click #fbButton':'loginWithFb'
            },
            loginWithFb: function(e){
                e.preventDefault();
                window.location.replace("/auth/facebook");
            },
            onShow: function () {

            },
            validate: function () {
                if (!this.$email || !this.$password) {
                    alert('Email or Password cannot be empty');
                    return false;
                } else {
                    return true;
                }
            },
            onSubmit: function (e) {
                e.preventDefault();
                var that = this;
                this.$email = $('#login-email').val();
                this.$password = $('#login-password').val();
                if (this.validate()) {
                    // make an ajax call to the server
                    var data = {
                        "email": this.$email,
                        "password": this.$password
                    };
                    console.log(data);
                    data = JSON.stringify(data);
                    $.ajax({
                        url: 'users/session',
                        type: 'POST',
                        contentType: 'application/json',
                        data: data,
                        success: function (data) {
                            // this is where we get our user data (all the fields)
                            console.log(data); // data.university, data.userid
                            if(that.options.RedirectedFromLink!='undefined' && that.options.RedirectedFromLink==true)
                            {
                                window.location.replace('/#article/'+that.options.RedirectItem);
                            }else{
                                window.location.replace("/#stream");
                            }
                        },
                        error: function (err) {
                            console.log(err);
                            alert(err.toString());
                        }


                    });
                }
            }
        });
        return loginView;
    });