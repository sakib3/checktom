define(
    [
        'app',
        'jade!../templates/StreamTemplate',
        'backbone',
        'models/ItemCollectionModel',
        '../views/AddNewItemView',
        '../views/ItemDetailView',
        '../views/EditProfileView',
        '../views/EditItemView',
        'socketio',
        'backbone_validation',
        'jquery',
        'jqueryUI',
        'jqueryTouch',
        'bootstrap',
        'facebook',
        'bootstrapSelect',
        'bootstrapSwitch',
        'flatuiCheckbox',
        'flatuiRadio',
        'flatuiTags',
        'flatuiplaceholder',
        'flatuiApp',
        'flatuiSwitch',
        'woomark',
        'growl'
        //,
        //'facebook'
    ],
    function (App, StreamTemplate, Backbone, ItemCollectionModel, NewItemView, ItemDetailView, EditProfileView, EditItemView, io) {
        var StreamView = Backbone.Marionette.Layout.extend({
            requireLogin: true,

            // make a if(flickswitch = stream)
            // then use streamitems.
            // else use searchitems.
            model: new ItemCollectionModel({StreamItems: "", SearchItems: ""}),
            SearchCurrentLocation: null,
            template: function () {
                console.log('trying to render Stream template');
                return _.template(StreamTemplate());
            },
            initialize: function (options) {
                var that = this;
                this.options = options || {};
                console.log(options);
                this.UseDistanceFilter = false;
                this.UsePriceFilter = false;
                console.log("UseDistance Filter = " + this.UseDistanceFilter);
                this.user = localStorage.getItem("username");
                this.SearchCurrentLocation = {lat: "", lng: ""};
                this.Geocoder = new google.maps.Geocoder();
                this.UseStreamCollection = true;
                this.lastSearchWord = '';
                this.get_items_from_search = null;
                this.socket = io.connect('/', {
                    'force new connection': true,
                    'reconnect': true,
                    'reconnection delay': 500,
                    'max reconnection attempts': 10
                });
                FB.init({
                    appId: '809566932407524',
                    status: true,
                    xfbml: true
                });
                this.notificationBuffer = [];
                // get current location fromg gps
                this.readMsg = function (sender, content, content_holder) {

                    var i = -1;
                    var postdata;
                    jQuery.each(that.notificationBuffer, function (index, value) {
                        if (value._id == content_holder.slice(1)) {
                            i = index;
                            return false; // retrun false to stop the loops
                        }
                    });
                    if (i != -1) {

                        $.growl(
                            {
                                title: "<strong>" + sender + ":</strong> ",
                                message: that.notificationBuffer[i].msg
                            },
                            {
                                type: "success",
                                delay: 0,
                                placement: {
                                    from: "top",
                                    align: "right"
                                },
                                offset: 70,
                                spacing: 10
                            }
                        );
                        console.log(that.notificationBuffer);
                        postdata = that.notificationBuffer[i]._id;
                        that.notificationBuffer.splice(i, 1);
                        $(content_holder).remove();
                        console.log('growling...');
                        console.log(that.notificationBuffer);
                        that.updateNotification();
                        $.ajax({
                            type: 'POST',
                            url: '/readNotification',
                            contentType: 'application/json',
                            data: JSON.stringify({'_id': postdata}),

                            success: function (data) {
                                console.log("notifications updated.....");
                                console.log(data);
                            },
                            error: function (data) {
                                //console.log("error");
                                console.log(data);
                            }
                        });

                    }

                    //console.log(content_holder);


                }
                this.pushToNotificationList = function (data) {
                    that.notificationIndicator();
                    console.log(data);
                    var time = (new Date()).getTime();
                    var message;
                    if (data.msg.length > 10) {
                        message = data.msg.substring(0, 9) + '...';
                    } else {
                        message = data.msg;
                    }

                    var string = '<li rel="0"><a id="' + data._id + '" href="https://checktomtest.nodejitsu.com/#item/' + data.atricleid + '"class="opt NotificationOption" target="_self" rel="external">' +
                        '<img style="float:left; margin-right:5px;" src="https://s3-eu-west-1.amazonaws.com/checktomfullpics/' + data.atricleid + '.jpg" width="50px" height="50px">'
                        + '<span class="pull-left">' + data.nick + '</span><br><span class="pull-left">Says: ' + message + '</span></a></li>';
                    $('#NotificationUL').html(string);
                    //that.updateNotification();
                    //that.showNotificationList(false);
                    that.notificationIndicator();


                }
                this.updateNotification = function () {
                    //console.log($('#notificationlist.nav.nav-list.nav-list-vivid').children());

                    var no_of_notification = $('#notificationlist.nav.nav-list.nav-list-vivid').children().length;
                    console.log('no_of_notification ' + no_of_notification);
                    if (no_of_notification != 0) {
                        $('#unread.navbar-new').html(no_of_notification);
                        $('#unread.navbar-new').show();
                    }

                    else {
                        $('#unread.navbar-new').hide();
                        that.showNotificationList(false);
                    }

                }
                this.showNotificationList = function (isTrue) {
                    if (isTrue)
                        $('#notificationlist').show();
                    else
                        $('#notificationlist').hide();
                }


                this.notificationIndicator = function () {
                    if ($('#NotificationUL').children().length > 2)
                        $('.glyphicon.glyphicon-bell.nav-notification').css('color', 'red');
                    else
                        $('.glyphicon.glyphicon-bell.nav-notification').css('color', 'none');
                }

                App.vent.on('popupclose', function () {
                    //var that=this;
                    console.log(that);
                    console.log(that.DropDownMenu)
                    //that.testFunction('vent');
                    console.log('popupclose called');
                    that.socket.on('new message', function (data) {
                        if (data.nick == that.user) {
                            //(that.notificationBuffer).push(data);
                            console.log('self msg');
                        } else {
                            var ind = -1;

                            jQuery.each(that.notificationBuffer, function (index, value) {
                                if (value.atricleid == data.atricleid) {
                                    ind = index;
                                    return false; // retrun false to stop the loops
                                }
                            });
                            if (ind != -1)
                                that.notificationBuffer[ind] = data;
                            else
                                (that.notificationBuffer).push(data);
                            $('#NotificationUL').html('');
                            for (var i = 0; i < that.notificationBuffer.length; i++)
                                that.pushToNotificationList(that.notificationBuffer[i]);
                            // append browse old
                            var string = '<hr/><a tabindex="-1" class="opt"><span id="older_notification" class="pull-left nav-notification-menu-span-browseolder">Browse older notifications</span></a>';
                            $('#NotificationUL').append(string);
                            that.notificationIndicator();
                            document.getElementById('notification_play').play();
                            $.growl(
                                {
                                    title: "<strong> You have a new message </strong> "//,
                                    //message: that.notificationBuffer[i].msg
                                },
                                {
                                    type: "success",
                                    //delay:0,
                                    placement: {
                                        from: "top",
                                        align: "right"
                                    },
                                    offset: 70,
                                    spacing: 10
                                }
                            );
                        }
                    });
                    console.log(that);
                });
            },
            // potentially addnew item could generate an invisible div, that is then animated to visibility
            regions: {
                DropDownMenu: "#AddNewItemRegion"
                // thislayout.AddNewItemMenu.show(new view);
            },
            events: {
                "click  #SearchButton": "searchToolSubmit",
                "click  #addNewItem": "OpenAddNewItemMenu",
                "change #location": "LocationChanged",
                "click  .searchItem img": "OpenDetailView",
                "mouseover .OverlayWrapper ":"showOverlay",
                "mouseout .OverlayWrapper ":"hideOverlay",
                "click  .searchItem h3": "OpenDetailView",
                "click  #logoutBtn": "logoutUser",
                "click  #EditProfileButton": "OpenEditProfileMenu",
                "slide #priceSlider": "SlideFilter",
                "slidestop #priceSlider": "SlideSort",
                "slide #distanceSlider": "SlideFilter",
                "slidestop #distanceSlider": "SlideSort",
                "keyup #search": "SearchEnter",
                "click #MyItemsButton": "MyItemsMenuOption",
                "click .NotificationOption": "pushClick",
                "click #older_notification": "getOlderNotification",
                "click .bootstrap-switch-container":"FlickSwitch"

            },
            test:function(){
              alert("testing")
            },
            tagsChange:function(){
                // trying to get around tagsinput variable scope blocking
                $("#distanceSlider").trigger("slidestop");
                //this.SlideSort();
            },
            FlickSwitch:function(e){
              // this should set the current active collection, and render it.
              // only called on flickswitch click.
                this.UseStreamCollection = $('#SwitchStream').is(":checked");
                console.log(this.UseStreamCollection);

                this.SlideSort();
            },
            getOlderNotification: function (e) {
                var that = this;
                $.ajax({
                    type: 'POST',
                    url: '/oldNotification',
                    contentType: 'application/json',
                    data: JSON.stringify({'user': that.user}),

                    success: function (data) {
                        console.log("Old Notifications.....");
                        console.log(data);
                    },
                    error: function (data) {
                        //console.log("error");
                        console.log(data);
                    }
                });
            },
            pushClick: function (e) {
                console.log('###Push click');
                e.preventDefault();
                console.log(e);
                console.log(e.currentTarget.childNodes[1].firstChild.data);
                var ind = -1;
                jQuery.each(this.notificationBuffer, function (index, value) {
                    if (value._id == e.currentTarget.id) {
                        ind = index;
                        return false; // retrun false to stop the loops
                    }
                });
                console.log(e);

                //alert(ind);
                //alert(this.notificationBuffer)
                console.log(this.notificationBuffer)
                var sendData = {'_id': e.currentTarget.id, 'read': true, 'all': true, nick: this.notificationBuffer[ind].nick, to: this.notificationBuffer[ind].to};
                console.log(sendData);
                this.socket.emit('set msg read flag', sendData);
                if (typeof(Storage) !== "undefined") {
                    localStorage.receiver = e.currentTarget.childNodes[1].firstChild.data;
                }
                console.log('window.location.hash  ' + window.location.hash);
                console.log('e.currentTarget.attributes[1].value.substr   ' + e.currentTarget.attributes[1].value.substr(1));
                if (window.location.hash == e.currentTarget.attributes[1].value.substr(1))
                    window.location.reload();
                //Depricated
                //window.location = e.currentTarget.attributes[1].nodeValue;
                window.location = e.currentTarget.attributes[1].value;
                window.onload = function () {
                    console.log('###window onload ');
                    if (!window.location.hash) {
                        console.log('###if ');
                        window.location = window.location + '#loaded';
                        window.location.reload();
                    }
                }
                //Backbone.history.navigate(e.target.pathname,{trigger:true});
            },
            MyItemsMenuOption: function (e) {
                console.log("MyItems")
                var that = this;
                $.ajax({
                    url: '/findAllArticlesByArtId',
                    type: 'GET',
                    //contentType: 'application/json',
                    //data: JSON.stringify({"keyword": "GetAllArticles"}),
                    //context: this,
                    success: function (data) {
                        // clear the list
                        console.log("loadstream");
                        console.log(data);
                        that.model.set({StreamItems: data});
                        that.RenderCollection(data);
                        $('#results').text(data.length);
                    },
                    error: function (data) {
                        console.log(data);
                    }
                })
                // this.DropDownMenu.show(new EditItemView());
            },
            SearchEnter: function (e) {
                var that = this;
                if (e.keyCode == 13) {
                    that.searchToolSubmit(e);
                }
            },
            SlideSort: function () {
                // check if search is active
                var that=this;
                console.log(that.UseStreamCollection);

                if(that.UseStreamCollection){
                    $('#search').val('');
                    console.log(that.model.get('StreamItems'));
                    that.RenderCollection(that.SortList(that.FilterSearch(that.model.get('StreamItems'))));
                }else{
                    console.log(that.model.get('SearchItems'));
                    $('#search').val(that.lastSearchWord);
                    that.RenderCollection(that.SortList(that.FilterSearch(that.model.get('SearchItems'))));
                }
            },
            SlideFilter: function (e) {
                var that = this;
                setTimeout(function () {
                        if(that.UseStreamCollection){
                            console.log(that.model.get('StreamItems'));
                            that.FilterSearch(that.model.get('StreamItems'));
                        }else{
                            console.log(that.model.get('SearchItems'));
                            that.FilterSearch(that.model.get('SearchItems'));
                        }
                }, 0);
            },
            logoutUser: function (e) {
                e.preventDefault();
                window.location.replace("/logout");
            },
            OpenDetailView: function (e) {
                e.preventDefault();

                var that = this;
                this.socket.removeAllListeners('new message');
                var flag = false;
                var ind = -1;

                that.socket.on('new message', function (data) {
                    if (data.nick == that.user) {

                    } else {
                        jQuery.each(that.notificationBuffer, function (index, value) {
                            if (value.atricleid == data.atricleid) {
                                ind = index;
                                return false; // retrun false to stop the loops
                            }
                        });
                        if (ind != -1)
                            that.notificationBuffer[ind] = data;
                        else
                            (that.notificationBuffer).push(data);
                    }
                });

                console.log("inOpenDetail");
                //console.log(that.options.RedirectItem._id);
                var currentTargetsId;
                if (e.OpenLink != undefined && e.OpenLink == true) {
                    currentTargetsId = that.options.RedirectItem._id;
                    that.sensorGps();
                } else {
                    currentTargetsId = $(e.currentTarget).data('itemid');

                }
                //this.DropDownMenu.close();

                console.log("clicked the item" + currentTargetsId);
                var post_data = {};
                post_data = {'_id': currentTargetsId};
                var newUserData = {'user': this.user, 'search_article_id': currentTargetsId};
                console.log('request to update search article id');
                that.socket.emit('update search_article_id', newUserData);
                $.ajax({
                    type: 'POST',
                    url: '/updateArticle',
                    contentType: 'application/json',
                    data: JSON.stringify(post_data),

                    success: function (data) {
                        //console.log("success");
                        //console.log(data);
                    },
                    error: function (data) {
                        //console.log("error");
                        console.log(data);
                    }
                });
                var ActualArticle = "invalid Article";
                var DontQueryBool = true;
                // all the items
                $.each(this.model.get('StreamItems'), function (index, ArticleFromSearch) {
                    console.log("collection article id");
                    console.log(ArticleFromSearch);
                    console.log("curernt target id");
                    console.log(post_data._id);
                    if (ArticleFromSearch._id == post_data._id) {
                        ActualArticle = ArticleFromSearch;

                    }
                });
                //console.log(ArticleFromSearch._id);
                // if owner thinks this is his article, make a check towards the server.
                var myArticles = JSON.parse(localStorage.getItem("articles"));
                //console.log("my articles");
                if (myArticles[0] != null) {
                    $.each(myArticles, function (index, userArticles) {
                        console.log(currentTargetsId+ " , "+ userArticles._id);
                        if (currentTargetsId == userArticles._id) {
                            DontQueryBool = false;
                            // make a check to the server, if returns true
                            $.ajax({
                                type: 'POST',
                                url: '/verifyOwnership',
                                contentType: 'application/json',
                                cache: false,
                                data: JSON.stringify(post_data),
                                success: function (data) {
                                    console.log("success");
                                    //var newUserData = {'user': this.user, 'search_article_id': ActualArticle._id};
                                    console.log(that.socket);
                                    //that.socket.emit('update search_article_id', newUserData);

                                    if (data.AccessKey == true) {

                                        console.log("server agreed to ownership");
                                        that.DropDownMenu.show(new EditItemView({data: ActualArticle, ownership: true, socket: that.socket}));
                                        //that.DropDownMenu.show(new ItemDetailView({data: ActualArticle, ownership: true, socket: that.socket}));
                                    } else {
                                        console.log("server declined ownership");
                                        that.DropDownMenu.show(new ItemDetailView({AccessToken:that.options.id.FBAccessToken,data: ActualArticle, ownership: false, socket: that.socket}));
                                    }

                                },
                                error: function (data) {
                                    console.log("error");
                                    console.log(data);
                                }
                            });
                        }
                    });
                } else {
                    console.log("client didn't request ownership.");
                    that.DropDownMenu.show(new ItemDetailView({AccessToken:that.options.id.FBAccessToken,data: ActualArticle, ownership: false, socket: that.socket}));
                }
                if (DontQueryBool) {
                    console.log("client didn't request ownership.");
                    that.DropDownMenu.show(new ItemDetailView({data: ActualArticle, ownership: false, socket: that.socket}));
                }

                if (document.getElementById('itemDetailView').offsetHeight < document.getElementById('itemDetailView').scrollHeight) {
                    $('#itemDetailView').css('overflow-y', 'scroll');
                } else {
                    $('#itemDetialView').css('overflow-y', 'hidden');
                }
            },
            OpenEditProfileMenu: function (e) {
                e.preventDefault();
                var that = this;
                that.DropDownMenu.close();
                that.DropDownMenu.show(new EditProfileView());
                //$('#profileSettings').slideToggle();
            },
            OpenAddNewItemMenu: function (e) {
                e.preventDefault();
                var that = this;
                //this.DropDownMenu.close();

                if (!$("#addNewItemBox").is(":visible")) {
                    console.log(that.SearchCurrentLocation);
                    this.DropDownMenu.show(new NewItemView({latLng: this.SearchCurrentLocation, initialLocation: $('#searchSpecLocation').val()}));
                    $("#AddNewItemTags").tagsInput();
                    console.log("the StreamItems collection");
                    console.log(that.model.get('StreamItems'));
                    console.log("the SearchItems collection");
                    console.log(that.model.get('SearchItems'));
                    $('body').css('overflow', 'hidden');
                } else {


                }
                setTimeout(function () {
                    if (document.getElementById('addNewItemBox').offsetHeight < document.getElementById('addNewItemBox').scrollHeight) {
                        $('#addNewItemBox').css('overflow-y', 'scroll');
                    } else {
                        $('#addNewItemBox').css('overflow-y', 'hidden');
                    }
                }, 500);
            },
            SetPriceEnabled: function () {
                if ($("#priceSlider").slider("option", "value") >= 3200) {
                    this.UsePriceFilter = false;
                } else {
                    this.UsePriceFilter = true;
                }
                console.log("UsePrice Filter = " + this.UsePriceFilter);
            },
            SetDistanceEnabled: function () {
                if ($("#distanceSlider").slider("option", "value") >= 25) {
                    this.UseDistanceFilter = false;
                } else {
                    this.UseDistanceFilter = true;
                }
                console.log("UseDistance Filter = " + this.UseDistanceFilter);
            },
            LocationChanged: function (e) {
                e.preventDefault();
                console.log("location changed");
                this.GoogleQuerySearch();
            },
            GoogleQuerySearch: function () {
                // try with query first so we can reuse this google api for more usecases.
                // get the adress and lat/lng of the google map location
                // save those values somewhere. for createItem usecase and searchQuery
                var that = this;
                var Query = $('#searchSpecLocation').val();
                console.log(Query);
                var latlng;
                if (Query != "") {

                    console.log('Geocoder getting ' + Query);
                    this.Geocoder.geocode({'address': Query }, function (results, status) {
                        if (status == google.maps.GeocoderStatus.OK) {
                            latlng = results[0].geometry.location;
                            console.log(results[0].address_components)
                            //alert(results[0].address_components)
                            that.SearchCurrentLocation = {lat: latlng.lat(), lng: latlng.lng()};
                            console.log(that.SearchCurrentLocation);
                            // adress:      $('results[0].formatted_address
                            // location:        latlng.lat(), latlng.lng()

                        } else {
                            console.log("google error");
                        }


                    });
                    // set the new location if succesfull, returns hte same location as before if failed.

                }
            },
            sensorGps: function () {
                var that = this;

                function errorCallback_highAccuracy(error) {
                    if (error.code == error.TIMEOUT) {
                        // Attempt to get GPS loc timed out after 5 seconds,
                        // try low accuracy location
                        console.log("attempting to get low accuracy location");
                        navigator.geolocation.getCurrentPosition(
                            successCallback,
                            errorCallback_lowAccuracy,
                            {maximumAge: 600000, timeout: 10000, enableHighAccuracy: false});
                        // testing without // return;
                    }

                    var msg = "<p>Can't get your location (high accuracy attempt). Error = ";
                    if (error.code == 1)
                        msg += "PERMISSION_DENIED";
                    else if (error.code == 2)
                        msg += "POSITION_UNAVAILABLE";
                    msg += ", msg = " + error.message;

                    console.log(msg);
                }

                function errorCallback_lowAccuracy(error) {
                    var msg = "<p>Can't get your location (low accuracy attempt). Error = ";
                    if (error.code == 1)
                        msg += "PERMISSION_DENIED";
                    else if (error.code == 2)
                        msg += "POSITION_UNAVAILABLE";
                    else if (error.code == 3)
                        msg += "TIMEOUT";
                    msg += ", msg = " + error.message;

                    console.log(msg);
                }

                function successCallback(position) {
                    var latitude = position.coords.latitude;
                    var longitude = position.coords.longitude;
                    console.log("<p>Your location is: " + latitude + "," + longitude + " </p><p>Accuracy=" + position.coords.accuracy + "m");
                    // now we got the latitutde longtitude values of the gps.
                    // now do something with them.
                    that.Geocoder.geocode({'address': latitude + "," + longitude }, function (results, status) {
                        if (status == google.maps.GeocoderStatus.OK) {
                            console.log(results[0]);
                            //(typeof results[0].address_components[1].long_name !== 'undefined' && typeof  results[0].address_components[2].long_name !== 'undefined' && typeof  results[0].address_components[5].long_name !== 'undefined')
                            if (false) {
                                // this wont happen
                                $('#searchSpecLocation').val(results[0].address_components[1].long_name + " " + results[0].address_components[2].long_name + " " + results[0].address_components[5].long_name)
                            } else {
                                console.log(results[0])
                                $('#searchSpecLocation').val(results[0].formatted_address);
                            }
                            console.log(that.SearchCurrentLocation);

                        } else {
                            console.log("google error");
                            console.log(status);
                        }


                    });
                    that.SearchCurrentLocation = {lat: latitude, lng: longitude};
                    that.loadStream();
                    console.log("" + that.SearchCurrentLocation.lat + "," + that.SearchCurrentLocation.lng)

                }

                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                        successCallback,
                        errorCallback_highAccuracy,
                        {maximumAge: 600000, timeout: 5000, enableHighAccuracy: true}
                    );
                }
            },
            searchToolSubmit: function (e) {
                e.preventDefault();
                var that = this;
                that.DropDownMenu.close();
                var data = {};
                data.keyword = $('#search').val();
                that.lastSearchWord = data.keyword;
                // make a java object with the correct field names
                if (typeof data.keyword !== "undefined" && data.keyword !== "" && data.keyword !== null) {
                    this.search(data);
                } else {
                    data.keyword = "GetAllArticles";
                    this.search(data);
                    console.log("fields didn't validate");
                }

            },

            // Query = Javascript object / JSON = {"keyword":" "}
            search: function (query) {
                var that = this;
                // Ajax append data from
                $.ajax({
                    url: '/searchQuery',
                    type: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify(query),
                    context: this,
                    success: function (data) {
                        // clear the list
                        console.log(data);
                        that.model.set({SearchItems: data});
                        // slidesort and set search collection to active.
                        that.UseStreamCollection = false;
                        that.RenderCollection(this.SortList(this.FilterSearch(data)));
                        $('#SwitchStream').bootstrapSwitch('toggleState',false);
                    },
                    error: function (data) {
                        console.log(data);
                    }
                })
            },
            FilterSearch: function (collection) {
                console.log("collection to be filtered");
                console.log(collection);
                this.SetDistanceEnabled();
                this.SetPriceEnabled();

                var that = this;
                var resultArray = [];
                var lat = this.SearchCurrentLocation.lat;
                var lng = this.SearchCurrentLocation.lng;
                var ListOfFilteredElements = [];

                //console.log(collection);
                console.log("price and dist filters");
                console.log(this.UsePriceFilter);
                console.log(this.UseDistanceFilter);
                if (this.UseDistanceFilter || this.UsePriceFilter) {
                    console.log("inside distfilter");
                    $.each(collection, function (index, element) {

                        resultArray = element;
                        var IsWithinDist = null;

                        if (that.UseDistanceFilter) {
                            var distSlide = $("#distanceSlider").slider("option", "value");
                            if (distSlide == 0) {
                                distSlide = 1;
                            }
                            IsWithinDist = that.IsWithinMaxDistance(element,
                                parseFloat(resultArray.LatLng.Lat),
                                parseFloat(resultArray.LatLng.Lng),
                                distSlide,
                                lat, // google lat / sensor lat
                                lng); // google lng / sensor lng

                        } else {
                            IsWithinDist = true;
                        }
                        var IsWithinPriceRange = null;
                        if (that.UsePriceFilter) {
                            console.log("price slider less than following");
                            console.log($('#priceSlider').slider("option", "value"))
                            IsWithinPriceRange = (resultArray.price <= $('#priceSlider').slider("option", "value"))
                        } else {
                            IsWithinPriceRange = true;
                        }
                        // if the elements distance is further from max, then false, else true.
                        // if the element is above the max price. then false, else true.
                        if (IsWithinDist && IsWithinPriceRange) {
                            ListOfFilteredElements.push(resultArray);
                            // filter distance parameter. But somehow save the collection for later use.
                        }

                    });
                    console.log("number of results after filter");
                    console.log(ListOfFilteredElements.length);
                    $('#results').text(ListOfFilteredElements.length);
                    console.log("collection after filter");
                    console.log(ListOfFilteredElements);
                    return ListOfFilteredElements;
                } else {
                    console.log("both filters are turned off");
                    $('#results').text(collection.length)
                    return collection;
                }


            },
            GetDistanceToCollection: function (collection) {
                console.log("collection to be filtered");
                console.log(collection);
                this.SetDistanceEnabled();

                var that = this;
                var resultArray = [];
                var lat = this.SearchCurrentLocation.lat;
                var lng = this.SearchCurrentLocation.lng;
                var ListOfFilteredElements = [];

                //console.log(collection);
                console.log("coordinates for dist calc from");
                console.log(this.SearchCurrentLocation.lat);
                console.log(this.SearchCurrentLocation.lng);
                console.log("inside distfilter");
                $.each(collection, function (index, element) {
                    console.log(element);
                    resultArray = element;


                    that.DistCalcBetween(resultArray,
                        parseFloat(resultArray.LatLng.Lat),
                        parseFloat(resultArray.LatLng.Lng),
                        lat, // google lat / sensor lat
                        lng); // google lng / sensor lng


                    // if the elements distance is further from max, then false, else true.
                    // if the element is above the max price. then false, else true.

                    ListOfFilteredElements.push(resultArray);
                    // filter distance parameter. But somehow save the collection for later use.


                });
                console.log(ListOfFilteredElements);
                return ListOfFilteredElements;


            },
            deg2rad: function (deg) {
                return deg * (Math.PI / 180)
            },
            getDistanceFromLatLonInKm: function (lat1, lon1, lat2, lon2) {
                var that = this;
                var R = 6371; // Radius of the earth in km
                var dLat = that.deg2rad(lat2 - lat1);  // deg2rad below
                var dLon = that.deg2rad(lon2 - lon1);
                var a =
                        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                            Math.cos(that.deg2rad(lat1)) * Math.cos(that.deg2rad(lat2)) *
                                Math.sin(dLon / 2) * Math.sin(dLon / 2)
                    ;
                var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                var d = R * c; // Distance in km
                return d;
            },
            DistCalcBetween: function (element, FromLat, FromLng, ToLat, ToLng) {
                var that = this;
                console.log(FromLat);
                console.log(FromLng);
                console.log(ToLat);
                console.log(ToLng);

                if (ToLat != "" && ToLng != "") {
                    var distance = that.getDistanceFromLatLonInKm(FromLat, FromLng, ToLat, ToLng);
                    if (distance >= 15) {
                        element.DistToUser = distance.toFixed(0) + " KM";

                    } else {
                        element.DistToUser = distance.toFixed(1) + " KM";
                    }
                    console.log(element);
                } else {
                    element.DistToUser = "Allow Gps";
                }
            },
            IsWithinMaxDistance: function (element, FromLat, FromLng, maxDist, ToLat, ToLng) {
                var that = this;
                if (maxDist !== 0) {
                    if (that.getDistanceFromLatLonInKm(FromLat, FromLng, ToLat, ToLng) <= maxDist) {
                        element.DistToUser = that.getDistanceFromLatLonInKm(FromLat, FromLng, ToLat, ToLng).toFixed(2) + " KM"
                        return true;
                    } else {
                        return false;
                    }
                }
                else {
                    return true;
                }
                console.log("error in max distance calc");

            },
            loadStream: function () {
                var that = this;
                // Ajax append data from
                $.ajax({
                    url: '/searchQuery',
                    type: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify({"keyword": "GetAllArticles"}),
                    context: this,
                    success: function (data) {
                        // clear the list
                        console.log("loadstream");
                        console.log(data);
                        that.model.set({StreamItems: data});
                        console.log(that.model.get({StreamItems: data}));
                        that.RenderCollection(data);
                        $('#results').text(data.length);
                    },
                    error: function (data) {
                        console.log(data);
                    }
                })
            },
            SortList: function (collection) {
                console.log("collection to be sorted");
                console.log(collection);
                // take a collection of articles, and sort them by number of matching array elements.
                var SearchTags = null;
                var result = [];
                $.each(collection, function (index, element) {
                    var article = element;
                    if ($('#searchHashtag .tagsinput').val() === "") {
                        SearchTags = [null];
                    } else {
                        SearchTags = $('#searchHashtag .tagsinput').val().toLowerCase().split(',');
                    }
                    var number_of_matches = SimpleJsLoop(article.hashTags, SearchTags);
                    article.TagMatches = number_of_matches;
                    result.push(article);
                });
                result.sort(function (a, b) {
                    return b.TagMatches - a.TagMatches;
                });

                console.log("sorted list by matching tags");
                console.log(result);
                return result;


                function SimpleJsLoop(x, y) {
                    var ret = [];
                    for (var i = 0; i < x.length; i++) {
                        for (var z = 0; z < y.length; z++) {
                            if (x[i] == y[z]) {
                                ret.push(i);
                                break;
                            }
                        }
                    }
                    return ret.length;
                }

                // do this by checking the number of matches for each article, and creating a value in the article object. Then save the "new" collection.
            },
            showOverlay:function(e){
                var SearchItemId = $(e.currentTarget).data('itemid');
                document.getElementById(SearchItemId).style.visibility = "visible";
            },
            hideOverlay:function(e){
                var SearchItemId = $(e.currentTarget).data('itemid');
                document.getElementById(SearchItemId).style.visibility = "hidden";
            },
            RenderCollection: function (collection) {
                console.log(collection);
                this.GetDistanceToCollection(collection);
                var resultArray;
                $('#itemList').html("");
                var Nr_Of_Articles = collection.length;
                $.each(collection, function (index, element) {
                    resultArray = element;
                    // handle title length
                    var descWordsTitle = resultArray.title.split(' ');
                    var resultSetTitle = "";

                    $.each(descWordsTitle, function (index, element) {
                        if (element.length < 17) {
                            resultSetTitle = resultSetTitle + element + ' ';
                        }
                        else {
                            var TooLongBits = element.match(/.{1,17}/g);
                            $.each(TooLongBits, function (index, element) {
                                resultSetTitle = resultSetTitle + element + '- ';
                            });
                        }
                    })
                    // handle description length
                    var descWordsdescription = resultArray.description.substr(0, 160).split(' ');

                    var resultSetDescription = "";
                    $.each(descWordsdescription, function (index, element) {
                        if (element.length < 17) {
                            resultSetDescription = resultSetDescription + element + ' ';
                        }
                        else {
                            var TooLongBits = element.match(/.{1,17}/g);
                            $.each(TooLongBits, function (index, element) {
                                resultSetDescription = resultSetDescription + element + '- ';
                            });
                        }
                    })
                    // filter distance parameter. But somehow save the collection for later use.
                    if (resultSetDescription.length >= 160) {
                        resultSetDescription = resultSetDescription + "...";
                    }
                    var imageHeight = null;
                    getImgSize(Nr_Of_Articles, "https://s3-eu-west-1.amazonaws.com/checktomthumbnails/" + resultArray.imageUrl + "?" + new Date().getTime(),resultArray._id);
                    Nr_Of_Articles = Nr_Of_Articles - 1;
                    $('#itemList').append(
                        "<div class='searchItem'  style='margin-bottom: 5px;'>" +
                            "<div class='OverlayWrapper' data-itemid='"+resultArray._id+"'>"+
                            "<div class='SearchItemOverlay' id='"+resultArray._id+"' style='visibility:hidden'></div>"+
                            "<img data-itemID="+resultArray._id+" src='https://s3-eu-west-1.amazonaws.com/checktomthumbnails/" + resultArray.imageUrl + "?" + new Date().getTime() + "' width='230' height='" + imageHeight + "'>" +
                            "</div>"+
                            "<div class='priceBox' style='margin: 0; padding-right: 10px;'>" + resultArray.price + " DKK </div>" +
                            "<div class='itemTextbox' style='margin-left: 10px; margin-right: 10px; margin-top: 0; margin-bottom: 0;'>" +
                            "<href src=''><h3 data-itemID="+resultArray._id+" style='color: #4FCD95; font-size: 20px; margin:15px 0px 10px 0px;'>" + resultSetTitle + "</h3></href>" +
                            "<p style='font-size: 14px; color: #7f8c8d; margin:0px 0px 20px 0px; line-height: 18px;'>" + resultSetDescription + "</p>" +
                            "</div><hr>" +
                            "<div class='itemFooter'>" +
                            "<div class='time'>" +
                            "<span class='glyphicon glyphicon-time'></span>&nbsp;" + resultArray.created +
                            "</div>" +
                            "<div class='view'>" +
                            "<span class='glyphicon glyphicon-eye-open'></span>&nbsp;" + ' ' + resultArray.no_of_view +
                            "</div>" +
                            "<div class='like'>" +
                            "<span class='glyphicon glyphicon-map-marker'></span>&nbsp;" + resultArray.DistToUser +
                            "</div>" +
                            "</div>" +
                            "</div>"
                    )
                    ;
                    // potential endless loop.
                    function getImgSize(remainingLoads, src,id) {

                        var i = 0;
                        var newImg = new Image();
                        newImg.src = src;
                        $(newImg).on('load', function () {
                            console.log(newImg.height);
                            console.log("wookmark was called");
                            imageHeight = newImg.height;
                            $('#'+id).css('height',imageHeight+"px");
                            if (remainingLoads = -1) {
                                var handler = $('#main .searchItem');
                                handler.wookmark({
                                    // Prepare layout options.
                                    autoResize: true, // This will auto-update the layout when the browser window is resized.
                                    container: $('#main'), // Optional, used for some extra CSS styling
                                    offset: 10, // Optional, the distance between grid items
                                    outerOffset: 10, // Optional, the distance to the containers border
                                    itemWidth: 230 // Optional, the width of a grid item
                                });
                            }

                        });
                        $(newImg).on('error', function () {
                            console.log("ImageErrorLoadingThumbnail");
                        })

                    }

                });

                var handler = $('#main .searchItem');

                handler.wookmark({
                    // Prepare layout options.
                    autoResize: true, // This will auto-update the layout when the browser window is resized.
                    container: $('#main'), // Optional, used for some extra CSS styling
                    offset: 10, // Optional, the distance between grid items
                    outerOffset: 10, // Optional, the distance to the containers border
                    itemWidth: 230 // Optional, the width of a grid item
                });

            },
            onClose: function () {
                this.socket.removeAllListeners('new message');
                this.socket.io.disconnect();

            },
            // Query = Javascript object / JSON = {"keyword":" ","price"  :"9999999999999","hashTags":[],"sortType":"default"}
            onShow: function () {
                console.log(this.options);
                console.log("STREAM ONSHOW");
                this.sensorGps();
                var that = this;
                that.DropDownMenu.close();

                that.notificationIndicator();
                // set #whiteboard height til searchspec.row height
                //
                // minus the padding and margin on whiteboard
                $('#whiteboard').height($('#searchSpec .row').height()-30);
                //
                console.log(this.socket);
                // socket initialize
                var newUserData = {'user': this.user, 'search_article_id': 'dummy'};
                this.socket.emit('new user', newUserData, function (data) {
                    console.log('Inside New User....' + that.user);
                    if (data) {
                        console.log("New user");
                        that.socket.emit('notifications', that.user, function (docs) {
                            console.log('Inside Notifications....');
                            if (typeof docs.length == 'undefined') {
                                console.log(docs);
                                //docs is not an array single element
                                that.notificationBuffer.push(docs);
                                that.pushToNotificationList(docs);
                                //that.pushToNotificationList(docs);
                            }
                            else { //docs is an array

                                for (var key = 0; key < docs.length; key++) {
                                    //insert to the notification buffer
                                    console.log(docs[key]);
                                    that.notificationBuffer.push(docs[key]);
                                    that.pushToNotificationList(docs[key]);
                                    //that.pushToNotificationList(docs[key]);
                                }

                            }
                            var string = '<hr/><a tabindex="-1" class="opt"><span id="older_notification" class="pull-left nav-notification-menu-span-browseolder">Browse older notifications</span></a>';
                            $('#NotificationUL').append(string);
                            console.log(data);
                            that.notificationIndicator();

                        });
                    } else {
                        //alert('That username is already taken! Try again.'+this.user);
                        console.log("user is already logged in");
                    }
                });
                // if in another view or not available - Push notification
                that.socket.on('new message', function (data) {
                    if (data.nick == that.user) {
                        //(that.notificationBuffer).push(data);
                        console.log('self msg');
                    } else {
                        var ind = -1;

                        jQuery.each(that.notificationBuffer, function (index, value) {
                            if (value.atricleid == data.atricleid) {
                                ind = index;
                                return false; // retrun false to stop the loops
                            }
                        });
                        if (ind != -1)
                            that.notificationBuffer[ind] = data;
                        else
                            (that.notificationBuffer).push(data);
                        $('#NotificationUL').html('');
                        for (var i = 0; i < that.notificationBuffer.length; i++)
                            that.pushToNotificationList(that.notificationBuffer[i]);
                        // append browse old
                        var string = '<hr/><a tabindex="-1" class="opt"><span id="older_notification" class="pull-left nav-notification-menu-span-browseolder">Browse older notifications</span></a>';
                        $('#NotificationUL').append(string);
                        that.notificationIndicator();
                        document.getElementById('notification_play').play();
                        $.growl(
                            {
                                title: "<strong> You have a new message </strong> "//,
                                //message: that.notificationBuffer[i].msg
                            },
                            {
                                type: "success",
                                //delay:0,
                                placement: {
                                    from: "top",
                                    align: "right"
                                },
                                offset: 70,
                                spacing: 10
                            }
                        );
                    }
                });
                $("#SearchTags").tagsInput({
                    onChange:that.tagsChange
                });


                var $priceSlider = $("#priceSlider");
                $priceSlider.slider({
                    min: 0, max: 3200,
                    value: 3200,
                    step: 200,
                    orientation: "horizontal",
                    range: "min",
                    slide: function (e, ui) {
                        $priceSlider.find(".current-value")
                            .text(ui.value)
                            .end();
                        if (ui.value < 3200) $priceSlider.find(".tooltip-inner").text(ui.value);
                        else $priceSlider.find(".tooltip-inner").text("∞");


                    }
                });


                $('#SwitchStream').bootstrapSwitch();
                var $distanceSlider = $("#distanceSlider");
                if ($distanceSlider.length > 0) {
                    $distanceSlider.slider({
                        min: 0,
                        max: 25,
                        value: 25,
                        step: 5,
                        orientation: "horizontal",
                        range: "min",
                        slide: function (e, ui) {
                            if (ui.value == 1) ui.value = 1;
                            else if (ui.value == 2) ui.value = 5;
                            else if (ui.value == 3) ui.value = 10;
                            else if (ui.value == 4) ui.value = 15;
                            else if (ui.value == 5) ui.value = 20;
                            else if (ui.value == 6) ui.value = 10000;
                            $distanceSlider.find(".current-value")
                                .text(ui.value)
                                .end();

                        }
                    });

                    distanceSliderOptions = $distanceSlider.slider("option");
                }
                //that.updateNotification();
                that.showNotificationList(false);
                function getContentFromClick(clickedItem) {
                    var no_of_notification = $('ul#notificationlist.nav.nav-list.nav-list-vivid').children().length;
                    if (no_of_notification > 0 && clickedItem != null && clickedItem.firstChild.data != null && clickedItem.firstElementChild.firstChild.data != null) {
                        //console.log(e.currentTarget.firstChild.data);
                        //console.log(e.currentTarget.firstElementChild.firstChild.data);
                        //console.log(e.currentTarget.parentNode.id);
                        var content_holder = '#' + clickedItem.parentNode.id;
                        var sender = clickedItem.firstChild.data;
                        var content = clickedItem.firstElementChild.firstChild.data;
                        console.log('content_holder' + content_holder);
                        console.log('sender' + sender);
                        console.log('content' + content);
                        console.log('clickedItem ID' + clickedItem.id);
                        that.readMsg(sender, content, content_holder);
                    }
                }

                $(document).click(function (e) {
                    console.log(that.notificationBuffer.length);
                    console.log(e.target.id);
                    var no_of_notification = $('ul#notificationlist.nav.nav-list.nav-list-vivid').children().length;
                    if (no_of_notification > 0) {

                        if (e.target.id == 'bell' || e.target.id == 'unread') {
                            that.showNotificationList(true);
                            console.log('bell or unread');

                        }
                        else if (e.target.id == 'user') {
                            that.showNotificationList(false);
                            console.log('User Profile');
                            console.log('user');

                        }

                        else if (e.target.id.charAt(0) == 'a') {
                            that.showNotificationList(false);
                            console.log('else if called');
                            getContentFromClick(e.target)

                        }
                        else {
                            that.showNotificationList(false);
                            console.log('else is called');
                            //getContentFromClick(e.target)

                        }
                    }

                });


                // Capture clicks on grid items.
                /*handler.click(function () {
                 toggleItemDetailView(this);
                 console.log(this[0].id);
                 });*/

                // old page loaders
                /*
                 var $distanceslider = $("#distance-slider");
                 var $priceslider = $("#price-slider");
                 // 0 means, ignore location
                 // 30 is the highest area we can calc.
                 $distanceslider.slider({
                 min: 0,
                 max: 30,
                 value: 15,
                 step: 5,
                 orientation: "horizontal",
                 range: "min",
                 slide: function (event, ui) {
                 //$distanceslider.val(ui.value);

                 var div = $(ui.handle).data("bs.tooltip").$tip[0];
                 var pos = $.extend({}, $(ui.handle).offset(), { width: $(ui.handle).get(0).offsetWidth,
                 height: $(ui.handle).get(0).offsetHeight
                 });

                 var actualWidth = div.offsetWidth;
                 $(div).offset({left: pos.left + pos.width / 2 - actualWidth / 2});

                 $(div).find(".tooltip-inner").text(ui.value);
                 }
                 });

                 $priceslider.slider({
                 min: 0, max: 3200,
                 value: 1600,
                 step: 200,
                 orientation: "horizontal",
                 range: "min",
                 slide: repositionTooltip
                 });

                 function repositionTooltip(e, ui) {

                 //$priceslider.val(ui.value);

                 var div = $(ui.handle).data("bs.tooltip").$tip[0];
                 var pos = $.extend({}, $(ui.handle).offset(), { width: $(ui.handle).get(0).offsetWidth,
                 height: $(ui.handle).get(0).offsetHeight
                 });

                 var actualWidth = div.offsetWidth;

                 $(div).offset({left: pos.left + pos.width / 2 - actualWidth / 2});

                 $(div).find(".tooltip-inner").text(ui.value);
                 }


                 $("#price-slider .ui-slider-handle:first").tooltip({title: $priceslider.slider("value"), placement: 'bottom', trigger: "focus"}).tooltip("hide");
                 $("#distance-slider .ui-slider-handle:first").tooltip({title: $distanceslider.slider("value"), placement: 'bottom', trigger: "focus"}).tooltip("hide");

                 */
                // Load the initial stream depending on wether it is redirected by link or ordinary login.
                if (this.options.RedirectedFromLink != true) {
                    this.loadStream();
                } else {
                    // if it is redirected by link, setup a stream with the article as result
                    // open the detailview for the user to interact.

                    $('#results').text(1);
                    that.RenderCollection([this.options.RedirectItem]);
                    this.model.set({StreamItems: [this.options.RedirectItem]})
                    that.OpenDetailView({OpenLink: true, preventDefault: function () {
                    }});

                }
                /*
                 $('#loadingDiv').hide();
                 // Hide it initially
                 .ajaxStart(function (e) {
                 console.log(e);
                 $(this).show();
                 })
                 .ajaxStop(function () {
                 $(this).hide();
                 });
                 */
                // Load google with their annoying asynch requirement.
                /*function loadScript() {
                 var script = document.createElement('script');
                 script.type = 'text/javascript';
                 script.src = 'https://maps.googleapis.com/maps/api/js?sensor=false&key=AIzaSyCAZUkdImuWP6QMjERNY_0vZpScekaztvY' +
                 'callback=initialize';
                 document.body.appendChild(script);
                 }

                 window.onload = loadScript;
                 */
            }
        });

        return StreamView;
    });