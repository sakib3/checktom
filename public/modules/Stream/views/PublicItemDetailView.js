define(
    [
        'jade!../templates/PublicItemDetailTemplate',
        'socketio',
        'app',
        'backbone',
        'backbone_validation'//,
        //'facebook'  new layout();
    ],
    function (ItemDetailTemplate, io, App, Backbone) {
        var PublicItemDetailView = Backbone.Marionette.Layout.extend({
            template: function () {
                console.log('trying to render ItemDetailView');
                var that = this;
                return _.template(ItemDetailTemplate());
            },
            initialize: function (options) {
                this.options = options || {};
                console.log("trying to start pubdetailview");
            },
            events: {
                "click": "redirectLogin"
            },
            redirectLogin:function(e){
                e.preventDefault();
                this.close();
                // if any action is taken on the site, redirects to login
                window.location.replace("/#signIn/"+this.options.data._id);
            },
            onShow: function () {
                console.log("trying to display stuff");
                //$("body").css("overflow","hidden");
                //$("#itemDetialView").css("overflow", "hidden");
                //$('#fadeBackground').show();
                //$('#addNewItemBox').css('display', 'block');
                var that = this;
                console.log(this.options.data);
                console.log("<p>" + this.options.data.description + "</p>");
                $('#idv_added').text(this.options.data.created);
                $('#idv_seen').text(this.options.data.no_of_view);
                $('#descrField').html("<p>" + this.options.data.description + "</p>");
                $('#authorName').text(this.options.data.author);
                $('#idv_price').text(this.options.data.price + " DKK");
                $('#idv_title').text(this.options.data.title);
                $('#idv_liked').text(" Login to view distance");
                $('#itemPictureImage').html("<img src='https://s3-eu-west-1.amazonaws.com/checktomfullpics/" + this.options.data.imageUrl + "?" + new Date().getTime() + "'>");
                // $( '#modalImg' ).html("<img src='https://s3-eu-west-1.amazonaws.com/checktomfullpics/"+this.options.data.Article.imageUrl+"'>");
                var tagString = "";
                var tagHtml = "",
                    tagHtmlStart = '<div class="idv_tag pull-left">',
                    tagHtmlEnd = '</div>';
                $.each(this.options.data.hashTags, function (index, value) {
                    tagString = tagString + "#" + value;
                    tagHtml = tagHtml + tagHtmlStart + "#" + value + tagHtmlEnd;
                });
                //$('#idv_hashtags').text(tagString);
                $('#idv_hashtags').html(tagHtml);
                $.get("https://s3-eu-west-1.amazonaws.com/checktomprofileimg/" + this.options.data.authorProfileImg)
                    .done(function () {
                        // Do something now you know the image exists.
                        $('#authorImage').html("<img src='https://s3-eu-west-1.amazonaws.com/checktomprofileimg/" + this.options.data.authorProfileImg + "'>");

                    }).fail(function () {
                        console.log("profile didn't load properly, using placeholder");
                        $('#authorImage').html("<img src='https://s3-eu-west-1.amazonaws.com/checktomprofileimg/userplaceholder.jpg'>");

                    })
            }
        });


        return PublicItemDetailView;
    });

