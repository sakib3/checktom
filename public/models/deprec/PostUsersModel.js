define(function (require) {
    var SignupModel = Backbone.Model.extend({
        urlRoot: '/updateSignedUser'
    });
    return SignupModel;
});
