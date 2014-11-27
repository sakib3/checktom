define(
    [
        'app',
        './views/StreamView',
        './views/PublicItemDetailView'
    ],
    function (App, StreamView, PubDetailView) {
        var redirectFB = false;
        var StreamController = Backbone.Marionette.Controller.extend({

            notFound: function () {
                    // notdefined route
            },
            GoToStream: function () {
                console.log("opening stream view");
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
                            App.content.show(new StreamView({id: data}));
                        } else {
                            window.location.replace("/#login");
                        }
                    },
                    error: function (err) {
                        console.log(err);
                        window.location.replace("/#login");
                    }
                });
            }
        });
        return new StreamController();
    });

