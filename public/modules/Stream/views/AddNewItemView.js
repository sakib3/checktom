define(
    [
        'app',
        'jade!../templates/AddNewItemTemplate',
        'backbone',
        'backbone_validation',
        'facebook'//,
        //'facebook'
    ],
    function (App, AddNewItemTemplate, Backbone) {
        var AddNewItemView = Backbone.Marionette.Layout.extend({
            template: function () {
                console.log('trying to render AddNewItemTemplate');
                var that = this;
                return _.template(AddNewItemTemplate());
            },
            initialize: function (options) {
                this.options = options || {};
                console.log(options);
                this.Geocoder = new google.maps.Geocoder();

            },
            onShow: function () {


                // on show is called when the view is created via the app.region.show(new view) call.
                $("#addNewItemBox").slideToggle();
                $('#AddItemLocationTextField').val(this.options.initialLocation);


            },
            events: {
                "submit #UploadForm": "sendForm",
                "click #cancelAddNewItem": "close",
                "change #AddImg": "thumbnail",
                "change #DescrHandle": "validateFormReminder",
                "change #addNewItemHeadline":"validateFormReminder",
                "change #addNewItemGiveAwayForFree":"validateFormReminder",
                "change #AddItemLocationTextField":"validateFormReminder",
                "change #addNewItemPrice":"validateFormReminder"
            },
            thumbnail: function (e) {
                var reader = new FileReader();
                reader.onload = function (event) {
                    var img = new Image();
                    img.onload = function () {
                        $('#AddImgThumb').attr('src', img.src);
                    }
                    img.src = event.target.result;
                }
                reader.readAsDataURL(e.target.files[0]);
                this.validateFormReminder();
            },
            onClose: function () {
                //$("#addNewItemBox").slideToggle();
            },
            validateAttri: function (obj) {
                if (typeof obj !== "undefined" && obj !== "" && obj !== null) {
                    return true;
                } else {
                    return false;
                }
            },
            // checks if the price is without letters and comma's.
            priceInputValidator: function (text) {
                var that = this;
                var acceptable = true, hasComma = false;
                for (var i = 0; i < text.length; i++) {
                    var c = text.charAt(i);
                    if (isNaN(c)) {
                        if (c == ',') {
                            if (hasComma) acceptable = false;
                            else hasComma = true;
                        }
                        else acceptable = false;
                    }
                }
                // seems to accept empty?
                if(acceptable == true){
                    acceptable = that.validateAttri(text);
                }
                return acceptable;
            },
            close: function (e) {
                $("#addNewItemBox").slideToggle(function () {
                    if (!$("#addNewItemBox").is(":visible") && !$('#itemDetailView').is(":visible")) {
                        $('body').css('overflow', 'auto');
                    }
                });
            },
            checkLength: function (string, maxlength) {
                if (string.length > maxlength) {
                    return false;
                } else {
                    return true;
                }
            },
            validateFormReminder:function(){
                var Validated = true;
                var IsTitleValid = $('#addNewItemHeadline').val();
                var IsPriceDefined = $('#addNewItemPrice').val();
                var IsPriceFree = $('#addNewItemGiveAwayForFree').attr('checked');
                var IsImgSelected = $('[name=image0]').val();
                var locationSelected = $('#AddItemLocationTextField').val();
                var descField = $('[name=description]').val();

                if (this.validateAttri(IsTitleValid)){
                    $('#addNewItemHeadline').css("border", "2px solid #bebebe");
                }else{
                    $('#addNewItemHeadline').css("border", "2px solid red");
                    Validated = false;
                }
                if(this.priceInputValidator(IsPriceDefined)){
                    $('#addNewItemPrice').css("border", "2px solid #bebebe");
                }else{
                    $('#addNewItemPrice').css("border", "2px solid red");
                    Validated = false;
                }
                if(this.validateAttri(IsPriceFree)) {
                    $('#addNewItemGiveAwayForFree').css("border", "2px solid #bebebe");
                }else{
                    $('#addNewItemGiveAwayForFree').css("border", "2px solid red");
                    Validated = false;
                }
                if(this.validateAttri(IsImgSelected)){
                    $('#ImgValidateHandle').css("border", "2px solid #00BDEF");
                }else{
                    $('#ImgValidateHandle').css("border", "2px solid red");
                    Validated = false;
                }
                if(this.validateAttri(locationSelected))
                {
                    $('#AddItemLocationTextField').css("border", "2px solid #00BDEF");
                }else{
                    $('#AddItemLocationTextField').css("border", "2px solid red");
                    Validated = false;
                }
                if(this.validateAttri(descField)){
                    $('[name=description]').css("border", "2px solid #00BDEF");
                }else{
                    $('[name=description]').css("border", "2px solid red");
                    Validated=false;
                }
                return Validated;
                // set element css temporarily 2px solid red
                // set to normal 2px solid #bebebe

            },
            sendForm: function (e) {
                e.preventDefault();
                var that = this;

                var IsTitleValid = $('#addNewItemHeadline').val();
                var IsPriceDefined = $('#addNewItemPrice').val();
                var IsPriceFree = $('#addNewItemGiveAwayForFree').attr('checked');
                if (this.validateFormReminder()) {

                    // create our formData object
                    var formData = new FormData($('#UploadForm')[0]);
                    formData.append("title", IsTitleValid);
                    // if isfree is checked, set price to 0
                    if (typeof IsPriceFree !== typeof undefined && IsPriceFree !== false) {
                        formData.append("price", JSON.stringify(0.0));
                    } else {
                        // if isfree isn't checked and ispricedefined exists, set price to the defined price.
                        formData.append("price", JSON.stringify(parseFloat(IsPriceDefined)));
                    }
                    var negotiable = $('#addNewItemPriceIsNegotiable').attr('checked');
                    if (typeof negotiable !== typeof undefined && negotiable !== false) {
                        formData.append("priceNegotiable", JSON.stringify(true));
                    } else {
                        formData.append("priceNegotiable", JSON.stringify(false));
                    }
                    var tags = JSON.stringify($('#hashtag .tagsinput').val().split(','));
                    if (tags === [""]) {
                        tags = JSON.stringify([null]);
                    }
                    console.log(tags);
                    formData.append("hashTags", tags); // hashtag array[string]

                    // google query = text search of the location keyword
                    var Query = $('#AddItemLocationTextField').val();
                    console.log(Query);
                    var latlng;

                    //$("#AddNewItemRegion").slideToggle();
                    $("#addNewItemBox").slideToggle(function () {
                        $('body').css('overflow', 'auto');
                    });
                    if (this.validateAttri(Query)) {
                        console.log('Geocoder getting ' + Query);
                        this.Geocoder.geocode({'address': Query }, function (results, status) {
                            if (status == google.maps.GeocoderStatus.OK) {
                                latlng = results[0].geometry.location;

                                console.log({lat: latlng.lat(), lng: latlng.lng()});
                                formData.append("Lat", JSON.stringify(latlng.lat()));
                                formData.append("Lng", JSON.stringify(latlng.lng()));
                                // adress:      results[0].formatted_address
                                // location:        latlng.lat(), latlng.lng()

                                // formData.append("priceNegotiable",false); // checkbox
                                // session from current user.
                                var articleID = 'tempArticleId';
                                var userID = 'tempUserId';
                                // facebook facebook facebook facebook facebook

                                /// insert facebook ui popup with the link to the article, link will be
                                // checktom.com/#article/:id

                                // facebook facebook facebook facebook facebook
                                $.ajax({
                                    type: 'POST',
                                    url: '/createArticle',
                                    //url: '/upload/:articleID',
                                    data: formData,
                                    cache: false,
                                    contentType: false,
                                    processData: false,
                                    headers: { 'articleID': articleID, 'userID': userID},
                                    success: function (data) {
                                        console.log("success");
                                        console.log(data);

                                        FB.getLoginStatus(function (response) {
                                            console.log(response);
                                            FB.ui({
                                                method: 'feed',
                                                caption: IsTitleValid,
                                                link: 'https://www.checktomtest.nodejitsu.com/#item/' + data.ArticleId,
                                                picture: 'https://s3-eu-west-1.amazonaws.com/checktomthumbnails/' + data.imageUrl,
                                                description: $('[name=description]').val()

                                            }, function (response) {
                                                console.log(response);
                                            });
                                            /*FB.ui({
                                             method: 'feed',
                                             caption: 'Help expand the community and get the chance to win an iPad mini!',
                                             name: 'Checktom.com',
                                             description: 'Checktom is a classifieds web-app designed with you in mind, focusing on housing, jobs/gigs, and buy/sell opportunities. Our goal is to deliver a user-friendly service, tailored to fit local and international students’ wants and needs.',
                                             display: 'popup',
                                             link: 'www.checktom.nodejitsu.com',
                                             picture: 'http://checktom.jit.su/img/ChecktomIcon.png'
                                             }, function (response) {
                                             if (response && response.post_id) {
                                             console.log("shared")
                                             // post was successfully posted
                                             // update db if email exists from Notify Me update the doc with 'fbShared' field true
                                             // if email doesnt exists update the doc with 'Notify Email' with field fbShared true and fbEmail facebook email
                                             var a = {'shared': true};
                                             } else {
                                             // do nothing
                                             console.log("not shared");
                                             }
                                             }
                                             );*/
                                        });
                                        alert("successfully submitted your item");
                                        //window.location.reload();
                                    },
                                    error: function (data) {
                                        console.log("error addnewitem");
                                        console.log(data);
                                        alert("Server didn't recieve your request because of: Missing Image");
                                    }
                                });
                            } else {
                                console.log("google error, or location doesn't exist");
                                $('#AddItemLocationTextField').css("border", "2px solid red");
                                alert("location doesn't exist");

                            }
                        });
                        // set the new location if succesfull, returns hte same location as before if failed.

                    } else {
                        console.log("google query value is empty");
                        if (this.options.latLng.lat == "" || that.options.latLng.lng == "") {
                            alert("Could not find your location, try enabling browser gps");
                            window.location.reload();
                        } else {

                            console.log(that.options);
                            formData.append("Lat", JSON.stringify(that.options.latLng.lat));
                            formData.append("Lng", JSON.stringify(that.options.latLng.lng));
                            // adress:      results[0].formatted_address
                            // location:        latlng.lat(), latlng.lng()

                            // formData.append("priceNegotiable",false); // checkbox
                            // session from current user.
                            var articleID = 'tempArticleId';
                            var userID = 'tempUserId';
                            $.ajax({
                                type: 'POST',
                                url: '/createArticle',
                                //url: '/upload/:articleID',
                                data: formData,
                                cache: false,
                                contentType: false,
                                processData: false,
                                headers: { 'articleID': articleID, 'userID': userID},
                                success: function (data) {
                                    console.log("success");
                                    console.log(data);
                                    FB.getLoginStatus(function (response) {
                                        console.log(response);
                                        FB.ui({
                                            method: 'feed',
                                            caption: IsTitleValid,
                                            link: 'https//www.checktomtest.nodejitsu.com/#item/' + data.ArticleId,
                                            picture: 'https://s3-eu-west-1.amazonaws.com/checktomthumbnails/' + data.imageUrl,
                                            description: $('[name=description]').val()

                                        }, function (response) {
                                            console.log(response);
                                        });
                                        /*FB.ui({
                                         method: 'feed',
                                         caption: 'Help expand the community and get the chance to win an iPad mini!',
                                         name: 'Checktom.com',
                                         description: 'Checktom is a classifieds web-app designed with you in mind, focusing on housing, jobs/gigs, and buy/sell opportunities. Our goal is to deliver a user-friendly service, tailored to fit local and international students’ wants and needs.',
                                         display: 'popup',
                                         link: 'www.checktom.nodejitsu.com',
                                         picture: 'http://checktom.jit.su/img/ChecktomIcon.png'
                                         }, function (response) {
                                         if (response && response.post_id) {
                                         console.log("shared")
                                         // post was successfully posted
                                         // update db if email exists from Notify Me update the doc with 'fbShared' field true
                                         // if email doesnt exists update the doc with 'Notify Email' with field fbShared true and fbEmail facebook email
                                         var a = {'shared': true};
                                         } else {
                                         // do nothing
                                         console.log("not shared");
                                         }
                                         }
                                         );*/
                                    });
                                    alert("successfully submitted your item");
                                    //window.location.reload();

                                },
                                error: function (data) {
                                    console.log("error");
                                    console.log(data);
                                    alert("Server didn't recieve your request because: " + data)
                                }
                            });
                        }
                    }
                } else {
                    alert("Input fields didn't validate");
                }

            }

        });

        return AddNewItemView;
    });

