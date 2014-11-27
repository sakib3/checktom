define(function (require) {
    var Profile = Backbone.Model.extend({
        urlRoot: '/profiles',
        initialize: function () {
            console.log('in profile model');
        }
    });
    return Profile;
});
