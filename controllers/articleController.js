var mongoose = require('mongoose'),
    moment = require('moment'),
    Article = mongoose.model('Articles'),
    photoController = require('./photoController.js'),
    formidable = require('formidable'),
    User = mongoose.model('User'),
    Chat = mongoose.model('chat');
moment.locale('en', {
    relativeTime : {
        future: "in %s",
        past:   "%s ago",
        s:  "sec",
        m:  "a min",
        mm: "%d min",
        h:  "an hour",
        hh: "%d hours",
        d:  "%d d",
        dd: "%d d",
        M:  "a month",
        MM: "%d months",
        y:  "a year",
        yy: "%d years"
    }
});

// Security principle behind having several methods doing "the same thing" eg fetching documents from the database.

// is that making a too direct connection to the database (might inadvertently allow the user to specify fields and potentially insert statements directly into our backend)

// Having methods specified for each different use-case also allows us to be very specific in the data we return to the user
// if volume or privacy becomes a factor.


var validateAttri = function (attribute) {
    if (typeof attribute !== 'undefined'
        && attribute !== null
        && attribute !== '') {
        return true;
    } else {
        return false;
    }
}
// edits any item value, but does not accept images.
// accepted format of ajax json.stringify(value)
// {"FieldNewValue":5000,articleId:'5405ab3eb546ec901f259d44',fieldToBeChanged:"price"}
// here is snipped of code
/*
 $.ajax({
 type: 'POST',
 url: '/UpdateSpecificAttribute',
 contentType: 'application/json',
 data: JSON.stringify({"FieldNewValue":5000,articleId:'5405ab3eb546ec901f259d44',fieldToBeChanged:"price"}),

 success: function (data) {
 console.log("success");

 },
 error:function(data){
 console.log("fail");
 }});
 */
exports.oldNotification = function (req, res) {
    console.log('Inside old notification....');
    var user = req.body.user;
    var oldNotificationList = [];
    Chat
        .find()
        .where(
        {'to': user }
    )
        /*.where({ $or: [
         {'to': user },
         {'nick': user }
         ] })*/
        .lean(false)
        .exec(function (err, docs) {
            if (err) throw err;
            //console.log(docs);
            if (typeof docs.length == 'undefined') {

                //docs is not an array single element
                oldNotificationList.push(docs);

            }
            else { //docs is an array
                for (var key = 0; key < docs.length; key++) {
                    //insert to the nameList only if it is not exist
                    oldNotificationList.push(docs[key]);


                }
            }
            console.log(oldNotificationList);
            res.send(oldNotificationList);

        });
}
exports.readNotification = function (req, res) {
    var doc_id = req.body._id;
    var query = { _id: doc_id };
    Chat.findOneAndUpdate(query, { read: true }, function (err, docs) {
        if (err)
        {
            console.log(err);
        }
        res.send(docs);
    });
}
// takes a multipart form, containing image file and articleId field
exports.EditImageForArticle = function (req, res) {
    if (req.session['userId'] != 'undefined' && req.session.loggedIn === true) {
        var form = new formidable.IncomingForm();
        form.parse(req, function (err, fields, files) {
            var ArticleId = fields.articleId;
            // find the user information of the session
            User.find({_id: req.session.userId}, function (err, docs) {
                if (err) {
                    console.log(err);
                } else {
                    console.log("docs" + req.user.name);
                    console.log(docs);
                    if (docs[0].name == req.user.name) {
                        // find the article that we are looking to edit
                        var i = 0;
                        console.log("verified user id");
                        // upload the new image, and if succesfull return success / error.
                        photoController.uploadNewArticleImg(ArticleId, files, res, function (bool) {
                            if (bool) {
                                res.send(200, "success");
                            } else {
                                res.send(300, "failure");
                            }
                        });
                    }
                }
            });
        })
    }
}
exports.EditHashtagsForArticle = function (req, res) {
    if (req.session['userId'] != 'undefined' && req.session.loggedIn === true) {
        var form = new formidable.IncomingForm();
        form.parse(req, function (err, fields, files) {
            var ArticleId = fields.articleId;
            // find the user information of the session
            User.find({_id: req.session.userId}, function (err, docs) {
                if (err) {
                    console.log(err);
                } else {
                    console.log("docs" + req.user.name);
                    console.log(docs);
                    if (docs[0].name == req.user.name) {
                        // find the article that we are looking to edit
                        // update hashtags
                            var hashTags = JSON.parse(fields.hashTags);
                            if (hashTags instanceof Array) {
                                console.log("array verified");
                            } else {
                                console.log("array declined");
                                hashTags = [null]
                            }
                            Article.findByIdAndUpdate(ArticleId, {"hashTags": hashTags}, function (err) {
                                if (err) {
                                    console.log("err");
                                    res.send(400, 'DB error');
                                } else {
                                    console.log("updated succesfully");
                                    res.send(200, 'Updated');

                                }
                            })
                        }
                    }

            });
        })
    }
}
exports.EditSingleAttri = function (req, res) {
    console.log("inside single attri")
    // if the user has a valid session that is equal to the supplied user id
    if (req.session['userId'] != 'undefined' && req.session.loggedIn === true) {
        // the new values
        var ArticleId = req.body.articleId;
        var AttriName = req.body.fieldToBeChanged;
        var AttributeValue = req.body.FieldNewValue;
        console.log(ArticleId);
        console.log(AttriName);
        console.log(AttributeValue);
        // find the current users authorId
        User.find({_id: req.session.userId}, function (err, docs) {
            if (err) {
                console.log(err);
            } else {
                console.log("docs" + req.user.name);
                console.log(docs);
                if (docs[0].name == req.user.name) {
                    Article.find({ _id: ArticleId }, function (err, docs) {
                        // and if the articleId we were given has an authorId equal to the sessioned user
                        if (docs[0].authorArticleId == req.user.authorArticleId) {
                            console.log("verified user id");
                            var json = {};
                            json[AttriName] = AttributeValue;
                            Article.findByIdAndUpdate(ArticleId, json, function (err) {
                                if (err) {
                                    console.log("err");
                                    res.send(400, 'DB error');
                                } else {
                                    console.log("updated succesfully");
                                    res.send(200, 'Updated');

                                }
                            })
                        } else {
                            console.log("not authorized to change this article");
                            res.send(401, "not authorized to change this article");
                        }
                    })
                }
            }
        });

    }
}

exports.findChatParticipantByAricleID = function (req, res) {
    var articleID = req.body.articleID;
    var user = req.body.user;
    var nameList = [];
    Chat
        .where({'atricleid': articleID})
        .find({ $or: [
            {'to': user },
            {'nick': user }
        ] })
        //.select('to nick atricleid')
        //.find()
        .lean(false)
        .exec(function (err, docs) {
            if (err) throw err;
            //console.log(docs);
            if (typeof docs.length == 'undefined') {

                if (typeof docs.to !== 'undefined') {//docs is not an array single element
                    //insert to the nameList only if it is not exist
                    if (nameList.indexOf(docs.to) == -1) {
                        nameList.push(docs.to);
                    }
                    //insert to the nameList only if it is not exist
                    if (nameList.indexOf(docs.nick) == -1) {
                        nameList.push(docs.nick);
                    }

                }

            }
            else { //docs is an array
                for (var key = 0; key < docs.length; key++) {
                    //insert to the nameList only if it is not exist
                    if (nameList.indexOf(docs[key].to) == -1) {
                        nameList.push(docs[key].to);
                    }
                    //insert to the nameList only if it is not exist
                    if (nameList.indexOf(docs[key].nick) == -1) {
                        nameList.push(docs[key].nick);
                    }

                }
            }

            //remove the username itself from the nameList
            if (nameList.indexOf(user) != -1) {
                var index = nameList.indexOf(user);
                nameList.splice(index, 1);

            }
            res.send(nameList);

        });

    //Chat.find({atricleid:articleID}, function (err, docs) {
    //   if (err) throw err;
    //   res.send(docs);
    //});
}
exports.FindItemByArtID = function (req, res) {
    var artId = req.body.ArticleId;
    //console.log(req.body);
    console.log("in article by id" + artId);

    Article.find({_id: new mongoose.Types.ObjectId(artId)}).lean().exec(function (err, docs) {
        if (err) {
            console.log(err);
            res.send(err);
        } else {
            var results = docs;
            //console.log(JSON.stringify(results));

            for (var i = 0; i < docs.length; i++) {
                var timeNow = moment().format("YYYY-MM-DD HH:mm Z");
                var timeCreated = moment(results[i].created).format("YYYY-MM-DD HH:mm Z");
                //set return parameter as a difference between current date and created date
                //takeout first 2 digits : 'in' words
                results[i].created = (moment(timeNow).from(moment(timeCreated))).substr(2);
            }

            res.send(results[0]);
        }
    });
}
exports.FindItemsByArtId = function (req, res) {
    console.log("we're in");
    var artId = req.user.authorArticleId
    //console.log(req.body);
    console.log("in article by id" + artId);
    Article.find({authorArticleId: artId}, function (err, docs) {
        if (err) {
            console.log(err);
            res.send(err);
        }
        else {
            console.log(docs);
            res.send(docs);
        }
    });
}
exports.deleteArticle = function (req, res) {
    var articleForDeletion = req.body.articleID;

    // if the user has a valid session that is equal to the supplied user id
    if (req.session['userId'] != 'undefined' && req.session.loggedIn === true) {

        User.find({_id: req.session.userId}, function (err, docs) {
            if (err) {
                console.log(err);
            } else {
                if (docs.name == req.user.name) {
                    Article.find({ _id: articleForDeletion }, function (err, docs) {
                        // and if the articleId we were given has an authorId equal to the sessioned user
                        if (docs.authorId == req.session.userId) {
                            docs.remove();
                            res.send(200);
                        } else {
                            console.log("not authorized to delete this article");
                            res.send(401, "not authorized to delete this article");
                        }
                    })
                }
            }
        });
    }
}
exports.updateClickCounter = function (req, res) {

    if (req.body._id) {
        var query = { _id: req.body._id };

        Article.findOneAndUpdate(query, {$inc: {no_of_view: 1}}).exec(function (err, thing) {
            console.log('::::::::::::::::::::::::::::::Article Update:::::::::::::::::::::::::::');
            // console.dir(thing);
            res.send('Number of Article View Updated');
        });
    }


}
exports.CreateArticle = function (req, res) {
    console.log("we're in!");
    console.log(req.user);
    var request = req;
    if (req.session.loggedIn === true);
    {
        var form = new formidable.IncomingForm();
        form.parse(request, function (err, fields, files) {
            console.log(fields);
            // if req.body.author == req.session.userid (user can change this varible through great work, but storing the session elsewhere so client only recieves a token may be a solution.)
            // http://stackoverflow.com/questions/6912223/is-it-possible-to-change-a-session-variable-client-side
            if (true) { // validateAttri(request.user.name) redis user session is active and = req.user.name then okay.
                if (validateAttri(fields.title) && validateAttri(fields.price) && validateAttri(fields.Lng) && validateAttri(fields.Lat) && validateAttri(fields.priceNegotiable) && validateAttri(fields.description)) {
                    // validate the fields in the form and make sure the required fields are filled.
                    console.log("tags:" + fields.hashTags);
                    var NewArticle = new Article({
                        author: request.user.name,
                        authorArticleId: request.user.authorArticleId,
                        title: fields.title,
                        description: fields.description,
                        priceNegotiable: fields.priceNegotiable, // boolean set in client
                        LatLng: {Lat: fields.Lat, Lng: fields.Lng} // numbers from strings probably.
                    });
                    var price = fields.price;
                    if (price > 0 || price != "free") {
                        NewArticle.price = price;
                    } else if (price == 0 || price == "free") {
                        NewArticle.price = 0;
                    }
                    console.log(price);
                    var hashTags = JSON.parse(fields.hashTags);

                    if (hashTags instanceof Array) {
                        console.log("array verified");
                        NewArticle.hashTags = hashTags;
                    } else {
                        console.log("array declined");
                        NewArticle.hashTags = [null]
                    }

                    if ((typeof fields.articleId != 'undefined') && fields.articleId != null && fields.articleId != "") {
                        console.log('article id found' + fields.articleId);
                        // mongoose hex-casts a non-objectId value. Or we can try to wrap the id.
                        NewArticle._id = fields.articleId;
                    } else {
                        console.log('no article id, creating new');
                        NewArticle._id = mongoose.Types.ObjectId().toString();
                        console.log("new id" + NewArticle._id);
                    }
                    NewArticle.imageUrl = NewArticle._id + ".jpg";
                    NewArticle.authorProfileImg = req.user.profilePicture;

                    // photocontroller returns true if succesfully saving the images.
                    photoController.photoUploadAndResize(NewArticle._id, files, function () {
                        console.log("in upsertinsertdata");
                        var upsertData = NewArticle.toObject();
                        delete upsertData._id;
                        Article.findByIdAndUpdate({"_id": NewArticle._id}, upsertData, {upsert: true}, function (err) {
                            if (err) {
                                console.log(err);
                                res.send(err);
                            } else {
                                console.log("success");
                                res.send({"ArticleUpdated": true, ArticleId: NewArticle._id, imageUrl: NewArticle._id + ".jpg"});
                            }
                        });
                    }, res);
                } else {
                    console.log('wrong input format');
                    res.send(500, 'form input incomplete');
                }
            } else {
                console.log('you are not logged in');
                res.send(500, 'you are not logged in');
            }
        });
    }
};


// ATM
// Query pipeline:
// Find results matching keyword, find results matching price limitation, find results matching hashtags.
// $in hashtags, is supposed to be an array ['hash1','hash2']from the client
exports.DeprecSearchArticles = function (req, res) {

    if (req.body.keyword != null && req.body.keyword != "") {

        console.log(req.body.sortType + 'body');
        var hashTags = req.body.hashTags;
        if (hashTags == null || hashTags == "") {
            hashTags = [null, null];
        }
        Search(req.body.keyword, req.body.price, hashTags, req.body.sortType, res);
    }
}
exports.SearchArticles = function (req, res) {
    var keyWord = req.body.keyword;
    if (keyWord == "GetAllArticles") {
        Article.find().lean().exec(function (err, docs) {
            if (err) {
                console.log(err);
                res.send(err);
            } else {
                var results = docs;
                //console.log(JSON.stringify(results));

                for (var i = 0; i < docs.length; i++) {
                    var timeNow = moment().format("YYYY-MM-DD HH:mm Z");
                    var timeCreated = moment(results[i].created).format("YYYY-MM-DD HH:mm Z");
                    //set return parameter as a difference between current date and created date
                    //takeout first 2 digits : 'in' words
                    results[i].created = (moment(timeNow).from(moment(timeCreated))).substr(2);
                }

                res.send(results);
            }
        })
    } else {
        Article.find(
            {$or: [
                {description: {$regex: keyWord, $options: 'i'}},
                {hashTags: { $elemMatch: {$regex: keyWord, $options: 'i'} }},
                {title: {$regex: keyWord, $options: 'i' }}
            ]}).lean().exec(function (err, docs) {
                if (err) {
                    console.log(err);
                    res.send(err);
                } else {
                    var results = docs;
                    //console.log(JSON.stringify(results));

                    for (var i = 0; i < docs.length; i++) {
                        var timeNow = moment().format("YYYY-MM-DD HH:mm Z");
                        var timeCreated = moment(results[i].created).format("YYYY-MM-DD HH:mm Z");
                        //set return parameter as a difference between current date and created date
                        //takeout first 2 digits : 'in' words
                        results[i].created = (moment(timeNow).from(moment(timeCreated))).substr(2);
                    }

                    res.send(results);
                }
            })
    }

}

// deprecated search pattern
function DeprecatedSearch(keyWord, price, hashTags, sortType, res) {
    console.log("keyword: " + keyWord + " other:" + price + hashTags + sortType);
    if (validateAttri(keyWord)) {
        var TenHashTags = [null, null, null, null, null,
            null, null, null, null, null];

        if (validateAttri(hashTags)) {
            for (i = 0; i < hashTags.length; i++) {
                // copy the hashtags from the client into our search algorithm.
                TenHashTags[i] = hashTags[i];
            }
        } else {
            hashTags = []
        }
        console.log(TenHashTags);

        var priceQuery = {};
        if (price == 'free' || price == 0) {
            priceQuery = {price: 0};
        } else if (price > 0) {
            priceQuery = {price: { $lt: parseInt(price) }};
        }
        console.log(priceQuery);
        // sorts the articles the number of matching hashtags descending
        var sortMethod = {$sort: {matches: -1}};
        if (sortType == "cheap") {
            var sortMethod = {$sort: {price: 1}};
        } else if (sortType == "expensive") {
            var sortMethod = {$sort: {price: -1}};
        }
        console.log("sortMethod: " + sortMethod);
        Article.aggregate(
            {$match: {$and: [
                {$or: [
                    {"hashTags": {$in: hashTags}},
                    {title: {$regex: keyWord, $options: 'i' }}
                ]},
                priceQuery
            ]
            }}, // filter to the ones that match
            {$unwind: "$hashTags"}, // unwinds the array so we can match the items individually
            {$group: { // groups the array back, but adds a count for the number of matches
                _id: "$_id",
                matches: {
                    $sum: {
                        $cond: [
                            {$eq: ["$hashTags", TenHashTags[0]]},
                            1,
                            {$cond: [
                                {$eq: ["$hashTags", TenHashTags[1]]},
                                1,
                                {$cond: [
                                    {$eq: ["$hashTags", TenHashTags[2]]},
                                    1,
                                    {$cond: [
                                        {$eq: ["$hashTags", TenHashTags[3]]},
                                        1,
                                        {$cond: [
                                            {$eq: ["$hashTags", TenHashTags[4]]},
                                            1,
                                            {$cond: [
                                                {$eq: ["$hashTags", TenHashTags[5]]},
                                                1,
                                                {$cond: [
                                                    {$eq: ["$hashTags", TenHashTags[6]]},
                                                    1,
                                                    {$cond: [
                                                        {$eq: ["$hashTags", TenHashTags[7]]},
                                                        1,
                                                        {$cond: [
                                                            {$eq: ["$hashTags", TenHashTags[8]]},
                                                            1,
                                                            {$cond: [
                                                                {$eq: ["$hashTags", TenHashTags[9]]},
                                                                1,
                                                                0
                                                            ]
                                                            }
                                                        ]
                                                        }
                                                    ]
                                                    }
                                                ]
                                                }
                                            ]
                                            }
                                        ]
                                        }
                                    ]
                                    }
                                ]
                                }
                            ]
                            }
                        ]
                    }
                },
                author: {$first: "$author"},
                authorId: {$first: "$authorArticleId"},
                title: {$first: "$title"},
                description: {$first: "$description"},
                price: {$first: "$price"},
                priceNegotiable: {$first: "$priceNegotiable"},
                LatLng: {$first: "$LatLng"},
                imageUrl: {$first: "$imageUrl"},
                HashTags: {$push: "$hashTags"},
                no_of_view: {$first: "$no_of_view"},
                created: {$first: "$created"}
            }
            },
            sortMethod, // sorts the articles by method
            // rebuilds the original structure
            {$project: {matches: 1, Article: {author: "$author", authorId: "$authorArticleId", title: "$title", description: "$description", price: "$price", LatLng: "$LatLng", HashTags: "$HashTags", no_of_view: "$no_of_view", created: "$created", imageUrl: "$imageUrl"}}},

            function (err, results) {
                if (!err) {
                    console.log(JSON.stringify(results));

                    for (var i = 0; i < results.length; i++) {
                        var timeNow = moment().format("YYYY-MM-DD HH:mm Z");
                        var timeCreated = moment(results[i].Article.created).format("YYYY-MM-DD HH:mm Z");
                        //set return parameter as a difference between current date and created date
                        //takeout first 2 digits : 'in' words
                        results[i].Article.created = (moment(timeNow).from(moment(timeCreated))).substr(2);
                    }

                    res.send(results);
                } else {
                    return err
                }
            }
        );
    } else {
        console.log('no keyword supplied');
    }
}