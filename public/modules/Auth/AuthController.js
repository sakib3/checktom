define(
    ['app', './views/SignupView', './views/LoginView','./views/SendNewPwView','./views/RecoverPasswordView'], function(App, SignupView, LoginView,SendNewPwView,RecoverPasswordView) {
        var redirectFB = false;
        var AuthController = Backbone.Marionette.Controller.extend({
            signup: function() {
                // redirect if logged in
                $.ajax({
                    url: '/isLoggedIn',
                    type: 'GET',
                    success: function (data) {
                        // this is where we get our user data (all the fields)
                        console.log("isloggedin");
                        console.log(data); // data.university, data.userid
                        //get the username from localstorage(given through login)
                        localStorage.setItem("username", data.username);
                        localStorage.setItem("articles", JSON.stringify(data.articles));
                        // var testvalue = JSON.parse(localStorage.getItem("articles"));


                        //compare the localstorage name to the name returned by our webservice
                        if (data != null && data != 'undefined' && data != 'not authorized') {
                            window.location.replace("/#stream");
                        } else {
                            App.content.show(new SignupView());
                        }
                    },
                    error: function (err) {
                        console.log(err);
                        App.content.show(new SignupView());
                    }
                });
            },
            login: function() {
                // redirect if logged in
                console.log('opening loginview');
                $.ajax({
                    url: '/isLoggedIn',
                    type: 'GET',
                    success: function (data) {
                        // this is where we get our user data (all the fields)
                        console.log("isloggedin");
                        console.log(data); // data.university, data.userid
                        //get the username from localstorage(given through login)
                        localStorage.setItem("username", data.username);
                        localStorage.setItem("articles", JSON.stringify(data.articles));
                        // var testvalue = JSON.parse(localStorage.getItem("articles"));


                        //compare the localstorage name to the name returned by our webservice
                        if (data != null && data != 'undefined' && data != 'not authorized') {
                            window.location.replace("/#stream");
                        } else {
                            App.content.show(new LoginView());
                        }
                    },
                    error: function (err) {
                        console.log(err);
                        App.content.show(new LoginView());
                    }
                });
            },
            loginRedirectedByItemLink:function(id){
                App.content.show(new LoginView({RedirectedFromLink: true, RedirectItem: id}));
            },
            signupRedirectedByItemLink:function(id){
                App.content.show(new SignupView({RedirectedFromLink:true,RedirectItem:id}));
            },
            recoverPassword:function(){
                App.content.show(new RecoverPasswordView());
            },
            SendPWEmail:function(id){
                console.log(id);
                //App.content.show(new SendNewPwView({uniqueKey:id}));
                App.content.show(new SendNewPwView({uniqueKey:id}));
            }
        });
        return AuthController;
    });