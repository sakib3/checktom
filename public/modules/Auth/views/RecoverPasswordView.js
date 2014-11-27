define(
    ['app',
        'jade!../templates/RecoverPasswordTemplate',
        'backbone', 'backbone_validation'],
    function (App, RecoverPasswordTemplate) {
        var RecoverPasswordView = Backbone.Marionette.Layout.extend({
            //el: $('#content'),
            template: function () {
                var that = this;
                return _.template(RecoverPasswordTemplate());
            },
            initialize: function (options) {
                this.options=options||{};
            },
            events: {
                'click #NewMail':'sendRecoveryMail'
            },
            sendRecoveryMail:function(){
                var Mail = $('#recoveryMail').val();

                if(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/.test(Mail)){
                $.ajax({
                    type: 'PUT',
                    url: '/recoverMail',
                    contentType: 'application/json',
                    cache: false,
                    data: JSON.stringify({"email":Mail}),
                    success: function (data) {
                        console.log("success");
                        console.log(data);
                        alert("Check your mail/Spam folder");
                        window.location.replace("/");

                    },
                    error: function (data) {
                        console.log("error");
                        console.log(data);
                    }
                });
                }else{
                    alert("wrong email format - use - email@domain.com")
                }
            },
            onShow: function () {

            }
        });
        return RecoverPasswordView;
    });