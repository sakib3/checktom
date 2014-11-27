define(
    [
        'jade!../templates/ItemDetailTemplate',
        'socketio',
        'app',
        'backbone',
        'backbone_validation',
        'jqueryScrollTo'//,
        //'facebook'  new layout();
    ],
    function (ItemDetailTemplate, io, App, Backbone) {
        var ItemDetailView = Backbone.Marionette.Layout.extend({
            template: function () {
                console.log('trying to render ItemDetailView');
                var that = this;
                return _.template(ItemDetailTemplate());
            },
            initialize: function (options) {
                this.options = options || {};
                console.log(options);
                this.user = localStorage.getItem('username');
                this.receiver = {};
                this.socket = options.socket;
                this.oldmsg;
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
                "click #send": "sendMsg",
                "click #chatList a": "switchUser",
                "click #idv_close": "close",
                "click #fadeBackground": "close"

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
                window.history.pushState({}, '', '/#stream');
                this.close();
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
            },
            loadChat: function (user) {



                // login - take backbone userdata and log us in on the server.

                //$nickBox.val('');

                /*
                 socket.on('usernames', function(data){
                 var html ='';
                 for (var i = 0 ; i<data.length ; i++) {
                 //chat name list should not contains user self name
                 if($nickBox.val()!==data[i]){
                 console.log('nickBox.val '+$nickBox.val()+'data[i] '+data[i]);
                 html += '<a href="#'+data[i]+'">'+data[i] +'</a>'+ '<br/>';
                 }

                 }
                 $users.html(html);
                 });
                 */

            },
            loadMutualFriends: function () {
                var that = this;
                // returns only friends who are on the CT app.
                // FB.api('/me/friends',{"access_token":"CAALgSZC1tlOQBAHaHhj92EZAgJrkI0fc6Rci5UTRtvfMsgCUBfI0uKZAzwEOK17Ga1qh5ffiN3zx1FlIZANYEegzBZCZBRZBLJrXPAVZCxsHrERYmPCMkGNfgAEHnMln4fOPNAeeTIYCPwwEHNNphKciOYdpHXqy0i7UsANkobSMXyN2E9OgenqQC7PJHIW0IYZAgJAcxyYPP3ev7D2QyxMPZB"});
                //this.options.from.stream
                console.log(that.options);
                console.log("Access token: ");
                var authorFBID = null;
                var yourAccessToken = null;
                //ajax service
                $.ajax({
                    url: '/GetAuthorData/' + this.options.data.authorArticleId,
                    cache: false,
                    success: function (data) {
                        console.log(data);

                        yourAccessToken = data.access;
                        authorFBID = data.id;
                        if (data !== null) {
                            console.log(authorFBID + " " + yourAccessToken);

                            FB.api(authorFBID,{"fields":"context","access_token": yourAccessToken},  function (response) {



                                // Array of mutual friends.
                                console.log(response);
                                console.log("Response arrayData Length"+response.context.mutual_friends.data.length);
                                console.log(response.context.mutual_friends.data[0]);
                                var MutualFriends = response.context.mutual_friends.data;
                                console.log("Response array length,number of loops "+MutualFriends.length);
                                $('#MutualFriendCount').html("<p>Mutual Friends: </p><p>"+ MutualFriends.length +"</p>")

                                var MutFriendsHtml = "";
                                for ( var i = 0; i < MutualFriends.length; i++ ) {
                                    //make a query for their imagen

                                    // setup an htmlStub that is to be finished in part 2.
                                    // maybe wrap picture url in a function that takes the html stub as a paramter

                                    // do something with index bigger than 5 or something.
                                    if (i< 5) {
                                        console.log(i);
                                        var nameArray = MutualFriends[i].name.split(' ');
                                        console.log(nameArray[0]+ " name " + i + " i - friendname " + MutualFriends[i].name);

                                        MutualFriendsRequest(nameArray[0],MutualFriends[i].name,function(){
                                            $('#MutualFriends').html(MutFriendsHtml);
                                        });

                                        function MutualFriendsRequest(name,fullname,callback){
                                        FB.api(MutualFriends[i].id, {fields: ['picture.type(large)'],"access_token": yourAccessToken}, function (response2) {
                                            console.log(response2);
                                            // append the img to our object
                                            MutFriendsHtml = MutFriendsHtml + "<div class='mutfriendsWrapper'><p>"+ name +"</p><img class='mutFriendPic' src='" + response2.picture.data.url + "' width='230' height='200' title='" + fullname +"'></div>";
                                            callback();
                                            //$('#MutualFriends').append("<div class='mutfriendsWrapper'><p>"+ name +"</p><img class='mutFriendPic' src='" + response2.picture.data.url + "' width='230' height='200' title='" + fullname +"'></div>");

                                        });
                                    }
                                    }

                                };
                            });
                        } else {
                            alert("Author is not facebook");
                        }

                    }
                });

                // target article author FBID, and current access token of the user

            },
            onShow: function () {
                console.log('Onshow started....');
                var that = this;
                // overwrite bootstrap container fixed width (1170px)
                //$('#itemDetailView .container').width('80%');
                window.history.pushState({}, '', '/#item/' + this.options.data.authorArticleId);
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
                if (window.addEventListener) {
                    window.addEventListener("keydown", onKeyDown, true);
                } else if (document.attachEvent) { // IE
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

                that.getParticipient();
                console.log(that.userListOnline);
                console.log(that.previousConversationParticipient);
                console.log("<p>" + this.options.data.description + "</p>");

                $("body").css("overflow", "hidden");
                //$("#itemDetialView").css("overflow", "hidden");
                $('#fadeBackground').show();
                $('#addNewItemBox').css('display', 'block');

                console.log("<p>" + this.options.data.description + "</p>");
                $('#idv_added').text(this.options.data.created);
                $('#idv_seen').text(' ' + this.options.data.no_of_view);
                $('#descrField').text(this.options.data.description);
                $('#authorName').text(this.options.data.author);
                $('#idv_title').text(this.options.data.title);
                $('#idv_price').text(this.options.data.price + " DKK");
                $('#idv_liked').text(" " + this.options.data.DistToUser);
                $('#itemPictureImage').html("<img id='IDV_Img' src='https://s3-eu-west-1.amazonaws.com/checktomfullpics/" + this.options.data.imageUrl + "?" + new Date().getTime() + "'>");
                // $( '#modalImg' ).html("<img src='https://s3-eu-west-1.amazonaws.com/checktomfullpics/"+this.options.data.Article.imageUrl+"'>");
                // loop for setting up hashtags
                var tagString = "";
                var tagHtml = "",
                    tagHtmlStart = '<div class="idv_tag pull-left">',
                    tagHtmlEnd = '</div>';
                $.each(this.options.data.hashTags, function (index, value) {
                    tagString = tagString + "#" + value;
                    // incase we wanna revert to using # - tagHtml = tagHtml + tagHtmlStart + "#" + value + tagHtmlEnd;
                    tagHtml = tagHtml + tagHtmlStart + value + tagHtmlEnd;
                });
                //$('#idv_hashtags').text(tagString);
                if (tagHtml != tagHtmlStart + tagHtmlEnd) {
                    $('#idv_hashtags').html(tagHtml);
                } else {
                    $('#idv_hashtags').html(tagHtmlStart + "No Tags" + tagHtmlEnd);
                }

                // load author image or set temporary
                var newImg = new Image();

                $(newImg).on('load', function () {
                    console.log(newImg.height);
                    $('#authorImage').html("<img src='https://s3-eu-west-1.amazonaws.com/checktomprofileimg/" + that.options.data.authorProfileImg + "'>");

                });
                $(newImg).on('error', function () {
                    console.log("profile didn't load properly, using placeholder");
                    $('#authorImage').html("<img src='https://s3-eu-west-1.amazonaws.com/checktomprofileimg/userplaceholder.jpg'>");

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
                    if (data.nick == that.user && data.atricleid == that.options.data._id) {
                        that.displayMsg(data, 'bubbledRight');
                    } else {
                        if (data.to == that.user) {
                            that.socket.emit('set msg read flag', {'_id': data._id, 'read': true});

                            that.displayMsg(data, 'bubbledLeft');
                            console.log('bubble left');
                            console.log('that.receiver.username ' + that.receiver.username);
                            console.log('data.to ' + data.to);

                            if (that.receiver.username != data.nick) {
                                that.receiver.username = data.nick;
                                that.socket.emit('load old msgs', that.options.data._id);
                                that.loadOldMsg();
                            }

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
                that.loadMutualFriends();

                var navigationBar = $('#navigation').height();
                var browserHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
                var titleHeight = $('#titlerow').height();
                var contentPadding = 20;
                // set maxheight..
                $('#IDV_Img').css("max-height", (browserHeight-navigationBar-(titleHeight+20)) + 'px');
                console.log(browserHeight-contentPadding-(titleHeight+20) + 'px');
                console.log($('.itemPictureImage img').css)

                $('#IDV_Img').css("max-width", (Math.max(document.documentElement.clientHeight, window.innerHeight || 0))+'px');
                console.log('Onshow end .....................');

            }
        });


        return ItemDetailView;
    });

