define(function (require) {
    var GetUsersModel = Backbone.Model.extend({
        urlRoot: '/getAllSignedUsers'
    });
    return GetUsersModel;
});
