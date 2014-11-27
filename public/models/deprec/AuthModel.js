define(function (require) {
    var AuthModel = Backbone.Model.extend({
        urlRoot: '/users',
        defaults: {
            email: '',
            password: ''
        },
        initialize: function () {
        },
        validation: {
            email: {
                required: true,
                pattern: 'email',
                msg: 'Please enter a valid email'
            },
            password: {
                required: true,
                msg: 'Please enter a password'
            }
        }
    });
    return AuthModel;
});
