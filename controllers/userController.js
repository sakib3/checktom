/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    mailController = require('../controllers/mailController'),
    photoController = require('../controllers/photoController'),
    formidable = require('formidable'),
    User = mongoose.model('User');
Article = mongoose.model('Articles');
// static variables
var saltReset = "hjklokdkdajswrj";
var saltVerifyAccount = "kjhlokdkdajswrj";


/**
 * Show Index Page
 */
exports.getAuthorFBID = function (req, res) {
    console.log("in fbid");
    console.log(req.params.id);
    var authorId = req.params.id;
    var response = {};
    console.log(authorId)
    if (req.user && req.session.loggedIn == true) {
        console.log("in session, req userid");
        console.log(req.user);

        User.findOne({'_id': req.user._id}, function (err, docs) {
            console.log("Requser");
            console.log(docs);
            if (docs.FBID !== null) {
                var MyAccessToken = docs.FBAccessToken;
                User.findOne({ 'authorArticleId': mongoose.Types.ObjectId(authorId) }, function (err, doc) {
                    if (err) {
                        console.log(err)
                        res.send(400);
                    } else {
                        // sets email,
                        console.log("Author");
                        console.log(doc);
                        if (doc.FBID !== null) {
                            res.send(200, {id: doc.FBID, access: MyAccessToken});
                        } else {
                            res.send(404, {});
                        }
                    }
                })
            }
        });

    }
}
// Edit - Email, city, university,
exports.EditUserInfo = function (req, res) {
    var newAttribute = req.body.newAttribute;
    var newValue = req.body.newValue;
    console.log("attempting editinfo" + newAttribute + " - " + newValue);
    // user must be logged in, identified, and the attribute they are trying to change must be declared as one of the three: email, city, university.
    if (req.user && req.session.loggedIn == true && (newAttribute == "email" || newAttribute == "city" || newAttribute == "university")) {
        console.log("Modifying new user");
        var ReqUser = req.user._id
        console.log(req.user._id);
        User.findOne({ _id: ReqUser }, function (err, docs) {
            if (err) {
                console.log(err)
                res.send(400);
            } else {
                // sets email,
                console.log(docs);
                docs[newAttribute] = newValue;
                docs.save(function (err, product) {
                    if (err) {
                        console.log(err);
                        res.send(400);
                    }
                    else {
                        console.log(product);
                        res.send(200);
                    }
                })
            }
        })
    }
}

// this is called from the resetpassword view.
// POST
exports.resetPassword = function (req, res) {
    // req.id url id.
    var uniqueKey = req.params.id;
    var delimited = uniqueKey.split("&d&lt&");
    // identifies the salttype and number.
    var zero = delimited[0];
    var salt = delimited[1];
    var number = delimited[2];
    var NewPw = req.body.password;
    console.log(req.body.password)
    // start one of the two processes, depending on salttype.
    if (salt === saltReset && parseInt(zero) == 0) {
        // set verified to "true" and save in db.
        // verification here
        console.log(number);
        User.findOne({ uniqueRecoveryString: number }, function (err, docs) {
            if (err) {
                console.log(err)
                res.send(400);
            } else {

                docs.password = NewPw;
                var NewRecoveryString = (Math.floor((Math.random() * 1000000000000000000) + 9999999999999999999));
                docs.uniqueRecoveryString = NewRecoveryString;
                docs.save(function (err, product) {
                    if (err) {
                        console.log(err);
                        res.send(400);
                    }
                    else {
                        console.log(product);
                        res.send(200);
                    }
                })
            }
        })
    }
    // get the resetlink from DB

    // check if the account is an FB account

    // get the new password // update the database
}
exports.index = function (req, res) {
    res.render('index', {
        'title': 'CHECKTOM'
    });
};
exports.verifyOwnership = function (req, res) {
    var articleToBeChecked = req.body._id;
    if (req.user && req.session.loggedIn == true) {
        console.log(req.session.userId);
        // lookup whos session this is
        User.find({_id: req.session.userId}, function (err, docs) {
            if (err) {
                console.log(err);
                res.send({"AccessKey": false});
            } else {
                // lookup the article that was requested made by this users id
                Article.find({_id: articleToBeChecked}, function (err, Adocs) {
                    if (err) {
                        console.log(err);
                        res.send({"AccessKey": false});
                    } else {
                        console.log(Adocs);
                        //(docs);
                        if (Adocs.authorId == docs.authorArticleId) {
                            res.send({"AccessKey": true});
                        }
                    }
                });
            }

        })

    } else {
        res.send({"AccessKey": false});

    }
}
// checks the current user sesions article id, and then returns all articles with this ID + username for client.
exports.isLoggedIn = function (req, res) {
    console.log('Checking Login Status');
    if (req.session.loggedIn == true) {

        // lookup whos session this is
        //console.log(req.session.userId);
        User.find({_id: req.session.userId}, function (err, docs) {
            if (err) {
                console.log(err)
            } else {
                // console.log(docs);
                var index = 0;
                if (docs[index] != null) {
                    // lookup articles made by this users id
                    console.log("authorId");
                    //   console.log(docs[0].authorArticleId);
                    Article.find({authorArticleId: docs[0].authorArticleId}, function (err, Adocs) {
                        if (err) {
                            console.log(err);
                        } else {
                            console.log("adocs");
                            // console.log(Adocs);
                            if (Adocs[index] != null) {
                                console.log("saving an actual doc");
                                var loginData = {
                                    authorArticleId: docs[0].authorId,
                                    email: docs[0].email,
                                    profilePicture: docs[0].profilePicture,
                                    city: docs[0].city,
                                    university: docs[0].university,
                                    username: docs[0].name,
                                    FBID: docs[0].facebook.id,

                                    FBAccessToken: docs[0].FBAccessToken,
                                    articles: Adocs};
                                res.send(loginData);
                            } else {
                                console.log("saving an empty articles");
                                var loginData = {
                                    authorArticleId: docs[0].authorId,
                                    email: docs[0].email,
                                    profilePicture: docs[0].profilePicture,
                                    city: docs[0].city,
                                    university: docs[0].university,
                                    username: docs[0].name,
                                    FBID: docs[0].facebook.id,
                                    FBAccessToken: docs[0].FBAccessToken,
                                    articles: ""
                                }
                                res.send(loginData);
                            }
                        }
                    });
                } else {
                    res.send(401, 'Not Authorized');
                }
            }
        })

    } else {
        res.send(401, 'Not Authorized');
    }
}


/**
 * Auth callback
 */

exports.authCallback = function (req, res, next) {
    // after logging in with facebook, go here.
    req.logIn(req.user, function (errors) {
        if (errors) {
            res.send(errors);
        }
        else {
            req.session.loggedIn = true;
            req.session.userId = req.user.id;
            var loginData = {id: req.user.id, username: req.user.name};
            res.send(loginData);
            res.redirect('/#stream');
        }
    })


};

/**
 * Create user
 */
exports.updateUser = function (req, res) {
    console.log("in post user");
    var request = req;
    if (req.session['userId'] != 'undefined' && req.session.loggedIn === true) {
        var form = new formidable.IncomingForm();
        form.parse(request, function (err, fields, files) {
            //console.log(fields);

            console.log("in form parse");
            //console.log(files);
            var query = {};
            if (fields.email) {
                query.email = fields.email;
            }
            if (fields.city) {
                query.city = fields.city;
            }
            if (fields.university) {
                query.university = fields.university;
            }
            var i = 0
            if (typeof files["image" + i] !== 'undefined' && typeof files["image" + i].name !== 'undefined' && files["image" + i].name !== null && files["image" + i].name !== '') {
                var authorId = req.user.authorArticleId + ".jpg";
                console.log("in filehandling");
                function next() {
                    query.profilePicture = authorId;
                    User.update({_id: req.session.userId}, query, function (err, docs) {
                        if (err) {
                            res.send(402);
                            console.log(err);
                        } else {
                            res.send(200);
                            //console.log(docs);
                        }
                    })
                }

                photoController.uploadProfilePicture(files, authorId, next)

            } else {
                User.update({_id: req.session.userId}, query, function (err, docs) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log(docs);
                    }
                })
            }
        })
    }
}
exports.create = function (req, res) {
    var user = new User(req.body);
    user.created_at = Date.now();
    user.provider = 'local';
    var AuthArticleId = mongoose.Types.ObjectId();
    user.authorArticleId = AuthArticleId;
    user.profilePicture = AuthArticleId + ".jpg";
    // initiatilize random string for user.
    var RegString = function () {
        // random 10 digit number.
        return Math.floor((Math.random() * 1000000000000000000) + 9999999999999999999);
    };
    user.uniqueRecoveryString = RegString();
    if (/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/.test(user.email) && validateAttri(user.city) && validateAttri(user.name) && validateAttri(user.university) && validateAttri(user.password)) {
        user.save(function (err) {
            if (err) {
                if (err.code != 'undefined' && err.code == '11000')
                    err.errors = {'email': {'message': 'This email is already registered'}};
                res.send(500, err.errors);
            } else {
                // send the verification email
                mailController.registrationMailSend(user);
                // here user is already created and stored in variable "user"
                // send a mail to newly created user
                mailController.registrationMailSend(user);
                req.logIn(user, function (errors) {
                    if (err) {
                        res.send(errors);
                    }
                    req.session.loggedIn = true;
                    req.session.userId = req.user.id;
                    res.send(req.user);
                });
            }
        });
    } else {
        res.send(500, 'Wrong Data Format');
    }
};
/**
 * Resetting password for the user
 */

/**
 * Find user by id
 */

exports.find = function (req, res) {
    console.log(req.user.id);
    var id = req.params.id == 'me' ? req.user.id : req.params.id;
    User.findOne({
        _id: id
    }, function (err, doc) {
        if (err) res.send(err);
        res.send(doc);
    });
};

/**
 * Log out the user
 */
exports.logout = function (req, res) {
    req.session.loggedIn = false;
    req.session.userId = null;
    req.logout();
    res.redirect('/');
}

validateAttri = function (attribute) {
    if (typeof attribute !== 'undefined'
        && attribute !== null
        && attribute !== '') {
        return true;
    } else {
        return false;
    }
}