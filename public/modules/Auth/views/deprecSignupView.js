define(
    [
        'jade!../templates/SignupTemplate',
        'models/SignupModel',
        'backbone',
        'backbone_validation'//,
        //'facebook'
    ],
    function (SignupTemplate, SignupModel, Backbone) {
        var signupView = Backbone.Marionette.Layout.extend({

            requireLogin: true,
            //el: $('#content'),

            model: new SignupModel(),

            template: function() {
                var that = this;
                return _.template(SignupTemplate());
            },
            initialize: function (options) {
                this.options = options || {};
                /*FB.init({
                    appId: '744860615530994',
                    status: true,
                    xfbml: true
                });*/
            },
            events: {
                "submit #registerForm": "register"
                // "click  #shareOnFB": "shareChecktom"
            },

            register: function (event) {
                event.preventDefault();

                // clearing out all the messages from error block
                $('.error-block').html('');

                var newUser = new SignupModel();
                var user_details = {
                    email: $('input[name=reg_email]').val()
                };
                this.model = newUser;

                Backbone.Validation.bind(this, {
                    valid: function (view, attr) {
                        event.preventDefault();
                        var $el = view.$('[name=reg_' + attr + ']');
                        $el.next('.error-block').html('');
                    },
                    invalid: function (view, attr, error) {
                        event.preventDefault();

                        var $el = view.$('[name=reg_' + attr + ']');
                        $el.next('.error-block').html(error);
                    }
                });
                var that = this;
                this.model.save(user_details, {
                    error: function (model, error) {
                        console.log(error.responseText);
                        var errors = JSON.parse(error.responseText);
                        $.each(errors, function (name, err) {
                            if (name == 'email')
                                $('[name=reg_email]').next('.error-block').html(err.message);
                        })
                    },
                    success: function (model, response) {
                        console.log(response);
                    }
                });
            },

            destroy_view: function () {

                //COMPLETELY UNBIND THE VIEW
                this.undelegateEvents();

                this.$el.removeData().unbind();

                //Remove view from DOM
                this.remove();
                Backbone.View.prototype.remove.call(this);

            }
        });

        return signupView;
    });
