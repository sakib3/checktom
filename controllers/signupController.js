/**
 * Module dependencies.
 */
/*var mongoose = require('mongoose'),
    User = mongoose.model('SignupUser');

exports.isLoggedIn = function (req, res) {
    console.log('hidoifjsdafjlksfk');
    if (req.user && req.session.loggedIn) {
        res.send(req.user.id);
    } else {
        res.send(401, 'Not Authorized');
    }
}
*/
/**
 * Create user
 */
/*
exports.create = function (req, res) {
    var user = new User(req.body);
    user.created_at = Date.now();
    user.provider = 'local';

    // initiatilize random string for user.
    var RegString = function () {
        // random 10 digit number.
        return Math.floor((Math.random() * 1000000000000000000) + 9999999999999999999);
    };
    user.uniqueRecoveryString = RegString();

    user.save(function (err) {
        if (err) {
            if (err.code != 'undefined' && err.code == '11000')
                err.errors = {'email': {'message': 'This email is already registered :)'}};
            res.send(500, err.errors);
        } else {
            req.logIn(user, function (errors) {
                if (err) {
                    res.send(errors);
                }
                req.session.loggedIn = true;
                res.send(req.user);
            });
        }
    });
};

exports.update = function (req, res) {
    if (req.session.loggedIn) {
        var user = req.body;
        if(user.shared){
            User.update({ _id: user._id }, {shared: true}, null, function (err, numberAffected, raw) {

            });
        }
    } else {
        res.send(401, 'Not Authorized');
    }
}
*/
/**
 * Find user by id
 */
/*
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
*/