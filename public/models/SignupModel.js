define(['backbone', 'backbone_validation'],function (Backbone) {
    var SignupModel = Backbone.Model.extend({
        urlRoot: '/users',
        idAttribute: '_id',
        defaults: {
            name:'',
            email: '',
            password:'',
            city:'',
            university:''
        },
        initialize: function () {
        },
        validation: {
            email: {
                required: true,
                pattern: 'email',
                msg: 'Please enter a valid email'
            },
            name: {
                required: true,
                msg: 'Please enter your name'
            }
            ,password: {
                required: true,
                msg: 'Please enter a valid email'
            },
            city: {
                required: true,
                msg: 'Please enter a valid email'
            },
            university: {
                required: true,
                msg: 'Please enter a valid email'
            }
        }
    });
    return SignupModel;
});
