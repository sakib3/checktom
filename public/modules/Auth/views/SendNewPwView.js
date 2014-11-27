define(
    ['app',
        'jade!../templates/SendNewPwTemplate',
        'backbone', 'backbone_validation'],
    function (App, SendNewPwTemplate) {
        var SendNewPwView = Backbone.Marionette.Layout.extend({
            //el: $('#content'),
            template: function () {
                var that = this;
                return _.template(SendNewPwTemplate());
            },
            initialize: function (options) {
                this.options=options||{};
            },
            events: {
                'click #submitNewPw':'UpdatePassword'
            },
            validateAttri: function (attribute) {
                if (typeof attribute !== 'undefined'
                    && attribute !== null
                    && attribute !== '') {
                    return true;
                } else {
                    return false;
                }
            },
            UpdatePassword:function(){
                var that = this;
                var pw1 = $('#pw1').val();
                var pw2 = $('#pw2').val();
                var uniqueKey = this.options.uniqueKey;
                console.log(uniqueKey);
                console.log(pw1)
                if(that.validateAttri(pw1) && that.validateAttri(pw2) && pw1 == pw2 )
                {
                    $('#passwordInput').html('<p>Will update password shortly.. please wait</p>')
                    $.ajax({
                        type: 'PUT',
                        url: '/changePassword/'+uniqueKey,
                        contentType: 'application/json',
                        cache: false,
                        data: JSON.stringify({"password":pw1}),
                        success: function (data) {
                            console.log("success");
                            console.log(data);
                            window.location.replace("/#login");

                        },
                        error: function (data) {
                            console.log("error");
                            console.log(data);
                        }
                    });
                }
                else
                {
                    alert("both boxes must match");
                }

            },
            onShow: function () {

            }
        });
        return SendNewPwView;
    });