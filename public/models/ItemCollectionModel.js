define(['backbone', 'backbone_validation'],function (Backbone) {
    var ItemCollectionModel = Backbone.Model.extend({

        initialize: function () {
            console.log("initializing collection model");
        }

    });
    return ItemCollectionModel;
});
