define(
    [
        'jade!../templates/LandingPageTemplate',
        'socketio',
        'app',
        'backbone',
        'backbone_validation'//,
        //'facebook'  new layout();
    ],
    function (LandingPageTemplate, io, App, Backbone) {
        var LandingPageView = Backbone.Marionette.Layout.extend({
            template: function () {
                console.log('trying to render LandingPage view');
                var that = this;
                return _.template(LandingPageTemplate());
            },
            initialize: function (options) {
                this.options = options || {};
            },
            events: {
                "click #login":"GoToLogin",
                "click #signup":"GoToSignup"
            },
            GoToSignup:function(){
                console.log(this.options.RedirectedFromLink!='undefined');
                console.log(this.options.RedirectedFromLink == true)
                if(this.options.RedirectedFromLink!='undefined'&&this.options.RedirectedFromLink == true){
                    window.location.replace('/#signup/'+this.options.RedirectItem);
                }else{
                    window.location.replace('/#signup');
                }

            },
            GoToLogin:function(){
                if(this.options.RedirectedFromLink!='undefined'&&this.options.RedirectedFromLink == true){
                    window.location.replace('/#login/'+this.options.RedirectItem);
                }else{
                    window.location.replace('/#login');
                }
            },
            onShow: function () {

            }

        });


        return LandingPageView;
    });

