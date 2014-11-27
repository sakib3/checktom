var mongoose = require('mongoose'),
    passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    FacebookStrategy = require('passport-facebook').Strategy,
    User = mongoose.model('User'),
    crypto = require('crypto'),
    photoController = require('../controllers/photoController');
    FB = require('fb');

module.exports = function (passport, config) {
    // require('./initializer')

    // serialize sessions
    passport.serializeUser(function (user, done) {
        done(null, user.id)
    });

    passport.deserializeUser(function (id, done) {
        User.findOne({
            _id: id
        }, function (err, user) {
            done(err, user)
        })
    });

    // use local strategy
    passport.use(new LocalStrategy({
            usernameField: 'email',
            passwordField: 'password'
        },
        function (email, password, done) {
            User.findOne({
                email: email
            }, function (err, user) {
                if (err) {
                    return done(err)
                }
                if (!user) {
                    return done(null, false, {
                        message: 'Unknown user'
                    })
                }
                if (!user.authenticate(password)) {
                    return done(null, false, {
                        message: 'Invalid password'
                    })
                }
                return done(null, user);
            })
        }
    ));

    // use facebook strategy
    passport.use(new FacebookStrategy({
            clientID: config.facebook.clientID,
            clientSecret: config.facebook.clientSecret,
            callbackURL: config.facebook.callbackURL,
            profileURL: 'https://graph.facebook.com/me?'
        },
        function (accessToken, refreshToken, profile, done) {
            console.log("inside the passport strategy");
            User.findOne({
                'facebook.id': profile.id
            }, function (err, user) {
                if (err) {
                    console.log("mongoose profile id error");
                    return done(err)
                } else {
                    if (!user) {
                        console.log(profile);
                        var userEmail;
                        // some users have an old "inavalid" facebook email that wont be returned.
                        console.log("trying to check attribute Emails");
                        console.log(profile['emails']);
                        console.log("result of is emails undefined");
                        console.log(profile.hasOwnProperty('emails'));
                        if (!profile.hasOwnProperty('emails')) {
                            userEmail = profile.id + '@facebook.com';
                        } else {
                            userEmail = profile.emails[0].value;
                        }
                        var now = new Date();
                        var pw = crypto.createHash('md5').update(now.toString()).digest('hex');
                        var AuthArticleId = mongoose.Types.ObjectId();
                        user = new User({
                            name: profile.displayName,
                            email: userEmail,
                            password: pw,
                            username: profile.username,
                            profilePicture: AuthArticleId + ".jpg",
                            provider: 'facebook',
                            authorArticleId: AuthArticleId,
                            city: '',
                            university: '',
                            created_at: Date.now(),
                            FBAccessToken:accessToken,
                            FBRefreshToken:refreshToken,
                            FBID:profile._json.id,
                            facebook: profile._json

                        })
                        console.log("API Getting the users FB picture");
                        FB.setAccessToken(accessToken);
                        FB.api('me', {fields: ['picture.type(large)']}, function (res) {
                            if (!res || res.error) {
                                console.log(!res ? 'error occurred' : res.error);
                                return;
                            } else {
                                console.log(res.picture.data.url);
                                photoController.uploadFacebookImg(AuthArticleId + ".jpg", res.picture.data.url, function (doSave) {
                                    if (doSave) {
                                        user.save(function (err) {
                                            if (err) {
                                                console.log(err)
                                            } else {
                                                user = user.toObject();
                                                user.accessToken = accessToken;
                                                return done(err, user);
                                            }
                                        })
                                    }else{
                                        console.log("facebook image error");
                                        user.save(function (err) {
                                            if (err) {
                                                console.log(err)
                                            } else {
                                                user = user.toObject();
                                                user.accessToken = accessToken;
                                                return done(err, user);
                                            }
                                        });
                                    }
                                })

                            }
                        });

                    } else {
                        console.log("existing user, recreating session");
                        user = user.toObject();
                        user.accessToken = accessToken;
                        return done(err, user);
                    }
                }
            })
        }
    ));
}
