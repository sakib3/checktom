define(
    [
        'jade!../templates/EditItemTemplate',
        'socketio',
        'app',
        'backbone',
        'backbone_validation',
        'jqueryScrollTo',
        'growl'//,
        //'facebook'  new layout();
    ],
    function (EditItemTemplate, io, App, Backbone) {
        var EditItemView = Backbone.Marionette.Layout.extend({
            template: function () {
                console.log('trying to render AddNewItemTemplate');
                var that = this;
                return _.template(EditItemTemplate());
            },
            initialize: function (options) {
                this.options = options || {};
                console.log(options);
                this.user = localStorage.getItem('username');
                this.receiver = {};
                this.socket = options.socket;
                this.oldmsg;
                this.notificationBuffer = [];
                this.userListOnline = [];
                this.tempUserList = [];
                this.displayMsg = function (data, style) {
                    //$('#bg').append('<div class='+style+'> ' + data.nick + data.msg + "</div>");
                    $('#bg').append('<div class=' + style + '> ' + data.msg + "</div>");
                    $('#chat_container').scrollTo('max', {axis: 'y'});

                }
                this.previousConversationParticipient = [];
                this.getParticipient = function () {
                    var post_data = {'articleID': this.options.data._id, 'user': this.user};
                    console.log("ArticleId,User, " + this.options.data._id + " " + this.user)
                    var that = this;
                    $.ajax({
                        type: 'POST',
                        url: '/findChatParticipantByAricleID',
                        contentType: 'application/json',
                        data: JSON.stringify(post_data),

                        success: function (data) {
                            console.log("findChatParticipantByAricleID");
                            console.log(data);
                            that.previousConversationParticipient = data;
                            for (key in that.previousConversationParticipient) {
                                console.log(that.previousConversationParticipient[key]);
                            }
                            that.socket.emit('userlist request', 1);
                        },
                        error: function (data) {
                            //console.log("error");
                            console.log(data);
                        }
                    });
                }
                this.UpdateChatList = function (user, online) {
                    console.log(':::::::Update Chat List:::::');
                    if (online) {
                        //add this user if doesn't exist
                        if (this.userListOnline.indexOf(user) == -1) {
                            this.userListOnline.push(user);
                            if (this.previousConversationParticipient.length != 0 && this.previousConversationParticipient.indexOf(user) != -1) {
                                console.log('true');
                                this.previousConversationParticipient.splice(this.previousConversationParticipient.indexOf(user), 1);
                            }

                        }

                    }
                    else {
                        //romove user from the list
                        if (this.userListOnline.indexOf(user) != -1)
                            this.userListOnline.splice(this.userListOnline.indexOf(user), 1);
                    }
                    console.log(this.userListOnline);
                    console.log('this.previousConversationParticipient');
                    console.log(this.previousConversationParticipient);
                    console.log(':::::::End Update Chat List:::::');
                }
                console.log("options");
                console.log(options);
                this.loadOldMsg = function () {
                    var that = this;
                    this.socket.on('load old msgs', function (docs) {

                        var style;
                        that.olgmsg = null;
                        that.oldmsg = docs;
                        console.log('Old message received');
                        console.log(that.oldmsg);
                        //that.receiver.username=receiver;
                        //load the previous chat conversion between from and to....
                        $("#bg").html(" ");
                        for (var i = 0; i < that.oldmsg.length; i++) {
                            /*console.log('i ' + i);
                             console.log('that.user ' + that.user);
                             console.log('that.oldmsg[i].nick ' + that.oldmsg[i].nick);
                             console.log('that.oldmsg[i].to ' + that.oldmsg[i].to);
                             console.log('that.receiver.username ' + that.receiver.username);
                             */
                            if (((that.user === that.oldmsg[i].nick) && (that.oldmsg[i].to === that.receiver.username)) || ( (that.user === that.oldmsg[i].to ) && (that.oldmsg[i].nick === that.receiver.username))) {
                                console.log('True....');
                                if (that.oldmsg[i].nick == that.user)
                                    style = 'bubbledRight';
                                else
                                    style = 'bubbledLeft';
                                that.displayMsg(that.oldmsg[i], style);
                            }
                        }
                    });

                }

            },
            events: {
                "submit #UploadForm": "sendForm",
                "click #eiv_close": "close",
                "click #fadeBackground":"close"
                //, "change #field" : "changeAttribute",
                // "change #field" : "changeImage"
                ,
                "click #eiv_toggleChangeHashtags": "ToggleChangeHash",
                "onblur #eiv_toggleChangeHashtags": "ToggleChangeHash",

                "click #eiv_toggleChangeTitle": "ToggleChangeTitle",
                "change #eiv_titleInput": "ToggleChangeTitle",
                "enter #eiv_titleInput": "ToggleChangeTitle",

                "click #eiv_toggleChangeDesc": "ToggleChangeDesc",
                "change #eiv_descInput": "ToggleChangeDesc",
                "enter #eiv_descInput": "ToggleChangeDesc",

                "click #eiv_toggleChangePrice":"ToggleChangePrice",
                "change #eiv_priceInput":"ToggleChangePrice",
                "enter #eiv_priceInput":"ToggleChangePrice",

                "change #UploadImgField": "ChangeImg",
                "click #editItemView":"eventStop"
            },
            eventStop:function(e){
                e.stopPropagation();
            },
            ChangeTitle: function () {
                // sends ajax to change text.
                this.changeAttribute($('#eiv_titleInput').val(), "title");

                // updates current text on itemdetailview to avoid having to reload the item.
                $('#eiv_title').text($('#eiv_titleInput').val());
                this.ToggleChangeTitle();

                // refresh stream liste for at undgå at de åbner item med fejldata.


            },
            ChangeDesc: function () {
                // sends ajax to change text.
                this.changeAttribute($('#eiv_descInput').val(), "desc");
                // updates current text on itemdetailview to avoid having to reload the item.
                $('#eiv_desc').text($('#eiv_descInput').val());
                this.ToggleChangeDesc();

            },
            changeAttribute: function (NewValue, FieldToBeChanged) {

                var ArtId = this.options.data._id;
                // ajax /UpdateSpecificAttribute
                //     this.options.data (id)    scary                              inputfieldvalue
                // {articleId:""   ,        fieldToBeChanged:""               , FieldNewValue:""}

                var SendData = {articleId: ArtId, fieldToBeChanged: FieldToBeChanged, FieldNewValue: NewValue};
                console.log(SendData)
                $.ajax({
                    type: 'POST',
                    url: '/UpdateSpecificAttribute',
                    //url: '/upload/:articleID',
                    data: JSON.stringify(SendData),
                    contentType: "application/json",
                    success: function (e) {

                        console.log(e);
                    },
                    error: function (e) {
                        console.log(e);
                    }

                })
            },
            ChangeImg: function () {
                var that = this;
                // /UpdateSpecificAttributeImage

                var formData = new FormData($('#UpNewImg')[0]);
                formData.append("articleId", that.options.data._id);
                $.ajax({
                    type: 'POST',
                    url: '/UpdateSpecificAttributeImage',
                    //url: '/upload/:articleID',
                    data: formData,
                    cache: false,
                    contentType: false,
                    processData: false,
                    success: function (e) {
                        // Problem with this webservice, will always return false.
                        console.log(e);
                        //alert("Image uploaded, refresh to update.")
                        $("#AuthImg").attr("src", $("#AuthImg").attr("src") + new Date());
                    },
                    error: function (e) {
                        console.log(e);
                        alert("Image uploaded, refresh to update.")
                    }
                });
                // takes a multipart form, containing image file and articleId field

            },
            ToggleChangeTitle: function () {
                var that = this;
                if ($('#eiv_title').css('display') != 'none') {
                    $('#eiv_title').hide();
                    $('#eiv_titleInput').show();
                } else {
                    that.changeAttribute($('#eiv_titleInput').val(), "title");

                    // updates current text on itemdetailview to avoid having to reload the item.
                    $('#eiv_title').text($('#eiv_titleInput').val());
                    $('#eiv_title').show();
                    $('#eiv_titleInput').hide();
                }
            },
            ToggleChangePrice: function () {
                var that = this;
                console.log("toggle price")
                if ($('#eiv_priceDisp').css('display') != 'none') {
                    $('#eiv_priceDisp').hide();
                    $('#eiv_priceInput').show();
                } else {
                    that.changeAttribute($('#eiv_priceInput').val(), "price");
                    // updates current text on itemdetailview to avoid having to reload the item.
                    $('#eiv_priceDisp').text($('#eiv_priceInput').val()+ " DKK");
                    $('#eiv_priceDisp').show();
                    $('#eiv_priceInput').hide();
                }
            },
            ToggleChangeDesc: function () {
                var that = this;
                console.log("toggle desc")
                if ($('#eiv_desc').css('display') != 'none') {
                    $('#eiv_desc').hide();
                    $('#eiv_descInput').show();
                } else {
                    that.changeAttribute($('#eiv_descInput').val(), "description");
                    // updates current text on itemdetailview to avoid having to reload the item.
                    $('#eiv_desc').text($('#eiv_descInput').val());
                    $('#eiv_desc').show();
                    $('#eiv_descInput').hide();
                }
            },
            ToggleChangeHash: function () {
                var that = this;
                if ($('#eiv_hashtags').css('display') != 'none') {
                    $('#eiv_hashtags').hide();
                    $('#hashtagsInputWrapper').show();
                } else {

                    var formData = new FormData();
                    var tags = JSON.stringify($('#hashtagsInputWrapper .tagsinput').val().split(','));
                    if (tags === [""]) {
                        tags = JSON.stringify([null]);
                    }
                    console.log(tags);
                    formData.append("articleId", that.options.data._id)
                    formData.append("hashTags", tags); // hashtag array[string]
                    $.ajax({
                        type: 'POST',
                        url: '/UpdateSpecificAttributeHashtags',
                        //url: '/upload/:articleID',
                        data: formData,
                        cache: false,
                        contentType: false,
                        processData: false,
                        success: function (e) {
                            console.log(e);
                        },
                        error: function (e) {
                            console.log(e);
                        }
                    });
                    // loop for setting up hashtags
                    var tagString = "";
                    var tagHtml = "",
                        tagHtmlStart = '<div class="idv_tag pull-left">',
                        tagHtmlEnd = '</div>';
                    if ($('#hashtagsInputWrapper .tagsinput').val().split(',') instanceof Array) {
                        // if array, make a readable string
                        $.each($('#hashtagsInputWrapper .tagsinput').val().split(','), function (index, value) {
                            tagString = tagString + "#" + value;
                            tagHtml = tagHtml + tagHtmlStart + value + tagHtmlEnd;
                        });
                        if(tagHtml!=tagHtmlStart +tagHtmlEnd)
                        {
                            $('#eiv_hashtags').html(tagHtml);
                        }else{
                            $('#eiv_hashtags').html(tagHtmlStart + "No Tags"+tagHtmlEnd);
                        }
                    } else {

                        tagString = "#" + tags;

                        $('#eiv_hashtags').text(tagString);
                    }
                    console.log(tagString);
                    $('#eiv_hashtags').show();
                    $('#hashtagsInputWrapper').hide();
                }
            },
            notificationIndicator: function () {
                if ($('#NotificationUL').children().length > 2)
                    $('.glyphicon.glyphicon-bell.nav-notification').css('color', 'red');
                else
                    $('.glyphicon.glyphicon-bell.nav-notification').css('color', 'none');
            },
            pushToNotificationList: function (data) {
                var that = this;
                that.notificationIndicator();
                console.log(data);
                var time = (new Date()).getTime();
                var message;
                if (data.msg.length > 10) {
                    message = data.msg.substring(0, 9) + '...';
                } else {
                    message = data.msg;
                }

                var string = '<li rel="0"><a id="' + data._id + '" href="http://localhost:3000/#item/' + data.atricleid + '"class="opt NotificationOption">' +
                    '<img style="float:left; margin-right:5px;" src="https://s3-eu-west-1.amazonaws.com/checktomfullpics/' + data.atricleid + '.jpg" width="50px" height="50px">'
                    + '<span class="pull-left">' + data.nick + '</span><br><span class="pull-left">Says: ' + message + '</span></a></li>';
                $('#NotificationUL').html(string);
                //that.updateNotification();
                //that.showNotificationList(false);
                that.notificationIndicator();


            },
            onShow: function () {
                console.log('Onshow started....');
                var that = this;

                window.history.pushState( {} , '', '/#item/'+ this.options.data.authorArticleId);
                window.onbeforeunload = function (evt) {
                    window.history.pushState({}, '', '/#stream');
                    location.reload(true);
                }
                if (window.addEventListener) {
                    window.addEventListener("keydown", onKeyDown, true);
                } else if (document.attachEvent) { // IE
                    alert(document);
                    document.attachEvent("onkeydown", onKeyDown);
                } else {
                    document.addEventListener("keydown", onKeyDown, true);
                }

                function onKeyDown(e) {
                    if ((e.keyCode == 82 && e.ctrlKey) || ((e.which || e.keyCode) == 116))
                    {
                        e.preventDefault();
                        window.history.pushState({}, '', '/#stream');
                        location.reload(true);
                    }
                }
                if (typeof(Storage) !== "undefined" && localStorage.receiver !== "undefined") {
                    if (that.receiver.username == null || that.receiver.username == 'undefined') {
                        console.log("localstorage reciever variable");
                        console.log(localStorage.receiver);
                        that.receiver.username = localStorage.receiver;
                        localStorage.removeItem("receiver");

                        this.socket.emit('load old msgs', that.options.data._id);
                        this.loadOldMsg();
                    }
                }

                that.getParticipient();
                console.log(that.userListOnline);
                console.log(that.previousConversationParticipient);
                console.log(this.options.data.hashTags);

                $("body").css("overflow", "hidden");
                //$("#itemDetialView").css("overflow", "hidden");
                $('#fadeBackground').show();
                $('#addNewItemBox').css('display', 'block');

                console.log("<p>" + this.options.data.description + "</p>");
                $('#eiv_added').text(this.options.data.created);
                $('#eiv_seen').text(' '+this.options.data.no_of_view);
                $('#eiv_desc').text(this.options.data.description);
                $('#eiv_descInput').text(this.options.data.description);
                $('#authorName').text(this.options.data.author);
                $('#eiv_priceDisp').text(this.options.data.price + " DKK");
                $('#eiv_priceInput').val(this.options.data.price);
                $('#eiv_title').text(this.options.data.title);
                $('#eiv_titleInput').val(this.options.data.title);
                $('#eiv_liked').text(" " + this.options.data.DistToUser);
                // loop for setting up hashtags
                $('#hashtagsInputWrapper .tagsinput').tagsInput();
                var tagString = "";
                var tagHtml = "",
                    tagHtmlStart = '<div class="idv_tag pull-left">',
                    tagHtmlEnd = '</div>';
                $.each(this.options.data.hashTags, function (index, value) {
                    tagString = tagString + "#" + value;
                    $('#hashtagsInputWrapper .tagsinput').addTag(value);
                    tagHtml = tagHtml + tagHtmlStart + value + tagHtmlEnd;

                });
                console.log(tagString);


                //$('#idv_hashtags').text(tagString);
                if(tagHtml!=tagHtmlStart +tagHtmlEnd)
                {
                    $('#eiv_hashtags').html(tagHtml);
                }else{
                    $('#eiv_hashtags').html(tagHtmlStart + "No Tags"+tagHtmlEnd);
                }


                $('#itemPictureImage').html("<img id='EIV_Img' src='https://s3-eu-west-1.amazonaws.com/checktomfullpics/" + this.options.data.imageUrl + "?" + new Date().getTime() + "'>");
                // $( '#modalImg' ).html("<img src='https://s3-eu-west-1.amazonaws.com/checktomfullpics/"+this.options.data.Article.imageUrl+"'>");

                // load author image or set temporary
                var newImg = new Image();

                $(newImg).on('load', function () {
                    console.log(newImg.height);
                    $('#authorImage').html("<img id='AuthImg' src='https://s3-eu-west-1.amazonaws.com/checktomprofileimg/" + that.options.data.authorProfileImg + "'>");

                });
                $(newImg).on('error', function () {
                    console.log("profile didn't load properly, using placeholder");
                    $('#authorImage').html("<img id='AuthImg' src='https://s3-eu-west-1.amazonaws.com/checktomprofileimg/userplaceholder.jpg'>");

                })
                newImg.src = 'https://s3-eu-west-1.amazonaws.com/checktomprofileimg/' + that.options.data.authorProfileImg;

                console.log(this.user);
                var oldmsg;
                if (this.user == 'undefined')
                    alert('Please log in again');

                this.socket.on('new message', function (data) {
                    console.log('New Message');
                    console.log('user ' + that.user);
                    console.log('nick ' + data.nick);
                    //console.log('receiver '+this.receiver.username);
                    console.log()
                    console.log()
                    console.log()
                    //alert(data.atricleid + " " + that.options.data._id)
                    //alert(data.atricleid == that.options.data._id)
                    // if the message is from me, in this article.
                    // then print my mesage from the right.
                    if (data.nick == that.user && data.atricleid == that.options.data._id) {
                        that.displayMsg(data, 'bubbledRight');
                    } else {
                        // if it is to me, in this article, write the chat msg
                        if (data.to == that.user && data.atricleid == that.options.data._id) {
                            that.socket.emit('set msg read flag', {'_id': data._id, 'read': true});
                            that.displayMsg(data, 'bubbledLeft');
                            console.log('bubble left');
                            console.log('that.receiver.username ' + that.receiver.username);
                            console.log('data.to ' + data.to);


                            // if its to me, but not in this article.


                            if (that.receiver.username != data.nick) {
                                that.receiver.username = data.nick;
                                that.socket.emit('load old msgs', that.options.data._id);
                                that.loadOldMsg();
                            }
                            // if its to me, but not in this article
                            // make a notification
                        }
                        if (data.to == that.user && data.atricleid !== that.options.data._id) {
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
                            var string = '<hr/><a tabindex="-1" class="opt"><span class="pull-left nav-notification-menu-span-browseolder">Browse older notifications</span></a>';
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
                    }

                });


                this.socket.on('usernames', function (data) {
                    //var that=this;
                    //console.log('this.userListOnline');
                    //console.log(that.userListOnline);
                    //copy the previous online list to temp
                    that.tempUserList = that.userListOnline;
                    that.userListOnline = [];
                    //console.log(tempUserList);
                    var html = '';
                    var isAuthor_online = false;
                    console.log('usernames: ' + data.length);
                    for (var i = 0; i < data.length; i++) {
                        //chat name list should not contains user self name
                        console.log('User list i' + i);
                        console.log('(data[i]).username ' + (data[i]).username);
                        console.log('that.options.data.author ' + that.options.data.author);
                        console.log('this.user ' + that.user);
                        console.log('data[i]).search_article_id ' + (data[i]).search_article_id);
                        console.log('that.options.data._id ' + that.options.data._id);
                        //Normal user.
                        /*if (that.user != that.options.data.author) {
                         console.log('Normal User');
                         //Normal user,  so it should only see the author if available
                         if (that.user != (data[i]).username && (data[i]).username == that.options.data.author) {
                         console.log('>>>>if if');
                         console.log((data[i]).username);
                         //set the receiver = author
                         that.receiver.username = (data[i]).username;

                         //only receiver should have different color in the list

                         html += '<ul>' + '<a href="#' + (data[i]).username + '">' + (data[i]).username + '</a>' + '</ul>';

                         }

                         }
                         else {
                         //Author itself
                         console.log('Author Itself::');
                         // Display only the active users who searched that article
                         if ((that.user != (data[i]).username) && ((data[i]).search_article_id == that.options.data._id)) {
                         console.log('>>>>else if');
                         console.log((data[i]).username);
                         html += '<ul>' + '<a href="#' + (data[i]).username + '">' + (data[i]).username + '</a>' + '</ul>';

                         }

                         }*/
                        //current user should not present into his list
                        if (that.user != (data[i]).username) {


                            //only those searched this article can see this

                            if (that.options.data._id == (data[i]).search_article_id) {

                                //if author then those who searched this article, will be in the list of this author
                                if (that.user == that.options.data.author) {
                                    //////  html += '<ul>' + '<a href="#' + (data[i]).username + '">' + (data[i]).username + '</a>' + '</ul>';
                                    //this user can set to receiver as a author if he is not the author of this article
                                    if (that.receiver.username == null || that.receiver.username == 'undefined')
                                        that.receiver.username = (data[i]).username;
                                    that.UpdateChatList((data[i]).username, true);
                                }

                            }
                            //Non-author, it should have only author in his list if author is online
                            if (that.user != that.options.data.author && that.options.data.author == (data[i]).username) {
                                isAuthor_online = true;
                                that.UpdateChatList((data[i]).username, true);
                            }
                        }


                    }

                    //if(isAuthor_online)
                    //html += '<ul>' + '<a href="#' + that.options.data.author + '">' + that.options.data.author + '</a>' + '</ul>';
                    console.log('<<<<Before start....');
                    console.log(that.userListOnline);
                    console.log(that.tempUserList);
                    console.log('>>>end before.....');

                    for (var key = 0; key < that.userListOnline.length; key++) {
                        console.log('that.userListOnlin ' + that.userListOnline[key]);
                        html += '<ul>' + '<a href="#' + that.userListOnline[key] + '">' + that.userListOnline[key] + '</a>' + '</ul>';
                        //
                        if (that.tempUserList.indexOf(that.userListOnline[key]) != -1) {
                            var index = that.tempUserList.indexOf(that.userListOnline[key]);
                            var item = that.userListOnline[key];
                            if (that.previousConversationParticipient.length != 0 && that.previousConversationParticipient.indexOf(item) == -1) {
                                //that.previousConversationParticipient.push(item);
                            }
                            that.tempUserList.splice(index, 1);

                        }
                    }
                    console.log('tempUserList');
                    console.log(that.tempUserList);
                    for (var key = 0; key < that.tempUserList.length; key++) {
                        if (that.previousConversationParticipient.indexOf(that.tempUserList[key]) == -1) {
                            that.previousConversationParticipient.push(that.tempUserList[key]);
                        }
                    }
                    console.log('that.previousConversationParticipient');
                    console.log(that.previousConversationParticipient);
                    for (var key = 0; key < that.previousConversationParticipient.length; key++) {
                        var offlineUsers = that.previousConversationParticipient[key];
                        html += '<ul>' + '<a style="color:red;" href="#' + offlineUsers + '">' + offlineUsers + '</a>' + '</ul>';
                    }
                    $('#chatList').html(html);


                });
                $('#msg').keyup(function (e) {
                    if (e.keyCode === 13) {
                        console.log('Enter key detected....');
                        that.sendMsg(e);
                    }
                });
                //this.socket.emit('userlist request', 1);
                var navigationBar = $('#navigation').height();
                var browserHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
                var contentPadding = 20;
                var titleHeight = $('#titlerow').height();
                // set maxheight..
                $('#EIV_Img').css("max-height", (browserHeight-navigationBar-contentPadding-(titleHeight+20)) + 'px');
                $('#EIV_Img').css("max-width", (Math.max(document.documentElement.clientHeight, window.innerHeight || 0))+'px');

                console.log('Onshow end .....................');


            },
            onClose: function () {
                $('#fadeBackground').hide();
                $('body').css('overflow', 'auto');
                console.log("clicked close window");
                //this.socket.disconnect();
                this.socket.removeAllListeners('new message');
                this.socket.removeAllListeners('usernames');
                //this.socket.unbind('new message');
                //this.socket.unbind('usernames');
                App.vent.trigger('popupclose');
                window.history.pushState( {} , '', '/#stream');
                this.close();
            },
            validateAttri: function (obj) {
                if (typeof obj !== "undefined" && obj !== "" && obj !== null) {
                    return true;
                } else {
                    return false;
                }
            },
            switchUser: function (e) {
                var that = this;
                var style;
                that.olgmsg = null;
                e.preventDefault();
                console.log(e.target.innerText);
                that.receiver.username = e.target.innerText;
                //make clicked user active and others as usual....
                //console.log(this.receiver.username);
                console.log(that.receiver.username);
                //clear the chat history
                $("#bg").html(" ");

                console.log('Request for old messages');
                this.socket.emit('load old msgs', that.options.data._id);
                /*this.socket.on('load old msgs', function (docs) {

                 that.oldmsg = docs;
                 console.log('Old message received');
                 console.log(docs);
                 //load the previous chat conversion between from and to....
                 $("#bg").html(" ");
                 for (var i = 0; i < that.oldmsg.length; i++) {
                 if (((that.user === that.oldmsg[i].nick) && (that.oldmsg[i].to === that.receiver.username)) || ( (that.user === that.oldmsg[i].to ) && (that.oldmsg[i].nick === that.receiver.username))) {
                 if (that.oldmsg[i].nick == that.user)
                 style = 'bubbledRight';
                 else
                 style = 'bubbledLeft';
                 that.displayMsg(that.oldmsg[i], style);
                 }
                 }
                 });*/
                this.loadOldMsg();

            },
            sendMsg: function (e) {
                var that = this;
                var style;
                console.log("USername variable");
                console.log(that.receiver.username);
                //prevent the default behviour of form submission
                //console.log($('#msg').val());
                e.preventDefault();
                //if receiver is not set
                if (typeof(that.receiver.username) == 'undefined' || that.receiver.username == null) {
                    //set the receiver
                    //by default set receiver as a author of that article
                    if (that.options.data.author != that.user) {
                        console.log("author is not equal ot user, AUTHOR IS: " + that.options.data.author);
                        that.receiver.username = that.options.data.author;
                    }
                    else {
                        //if($('#chatList').children().length!=0)
                        if ($('#chatList').length > 0 && $('#chatList')[0].firstChild != 'undefined' && $('#chatList')[0].firstChild != null) {

                            that.receiver.username = $('#chatList')[0].firstChild.innerText;


                            console.log("USername variable");
                            console.log(that.receiver.username);
                        }
                    }
                }
                // console.log($('#chatList').length);

                //console.log($('#chatList')[0]);
                //check wheather receiver is set
                if (typeof(that.receiver.username) != 'undefined' || that.receiver.username != null) {
                    //get value from the messageBox and write to the socket
                    var msgToSend = "#" + that.receiver.username + '#' + that.options.data._id + '#' + $('#msg').val();
                    console.log('msgToSend: ' + msgToSend);
                    that.socket.emit('send message', msgToSend, function (data) {
                        //$('#chat').append('<span class="error">' + data + "</span><br/>");
                    });
                    //clear the messageBox value
                    $('#message').val('');
                }
                //clear the input field

                $('#msg').val('');
            }

        });

        return EditItemView;
    });

