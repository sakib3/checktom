define(
    [
        'app',
        'backbone',
        'marionette',
        'modules/Auth/AuthApp',
        'modules/Stream/views/PublicItemDetailView',
        'modules/Stream/views/StreamView',
        'modules/Stream/views/LandingPageView'
    ],
    function (App, Backbone, M, auth, PublicItemDetailView, StreamView,LandingPageView) {
        var GlobalController = Backbone.Marionette.Controller.extend({
            index: function () {
                    // redirect if logged in else go to landing page

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
                            window.location.replace("/#stream");
                        } else {
                            App.content.show(new LandingPageView());
                        }
                    },
                    error: function (err) {
                        console.log(err);
                        App.content.show(new LandingPageView());
                    }
                });
            },
            SignInWithItemId:function(id){
                App.content.show(new LandingPageView({RedirectedFromLink: true, RedirectItem: id}));
            },
            invokeAdminToolsModule: function () {
                require(["modules/AdminTool/AdminToolsApp"], function (AdminToolApp) {

                });
            },
            invokeAuthModule: function () {
                require(["modules/Auth/AuthApp"], function (AuthApp) {

                });
            },
            invokeStreamModule: function () {
                require(["modules/Stream/StreamApp"], function (StreamApp) {
                });
            },
            directLink: function (id) {
                var that = this;
                console.log("article id " + id);
                // checks if the item exists
                $.ajax({url: '/findSpecificArticle',
                    type: 'POST',
                    data: JSON.stringify({ArticleId: id}),
                    cache: false,
                    contentType: 'application/json',
                    success: function (article) {
                        console.log(article);
                        if (article != null) {
                            // if item exists
                            //determine if link-goer is logged in or not.
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
                                        // if user is logged in
                                        App.content.close();
                                        // stream opens, but needs the item + a "isRedirected" bool value in the options object
                                        App.content.show(new StreamView({id: data, RedirectedFromLink: true, RedirectItem: article}));

                                    } else {
                                        // if not logged in
                                        // opens public itemdetailview
                                        App.content.close();
                                        App.popup.show(new PublicItemDetailView({data: article}));
                                    }
                                },
                                error: function (err) {
                                    console.log(err);
                                    App.content.close();
                                    App.popup.show(new PublicItemDetailView({data: article}));
                                }
                            });


                        }

                    },
                    error: function (data) {

                    }})


            }
        });
        return new GlobalController();
    });