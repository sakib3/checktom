var mongoose = require('mongoose'),
    User = mongoose.model('SignupUser');



// post to this and you can update an email.
exports.updateUser = function (req, res) {
        var user = req.body;
            console.log(user);
            User.update({ email: user.email }, {created_at:user.created_at,number_of_friends:user.number_of_friends,shared: user.shared}, null, function (err, numberAffected, raw) {
            console.log(err +' '+ numberAffected)
                res.end();
        });
}

exports.getListOfUsers = function(req,res){
    User.find({}, function (err, users) {
        var userMap = {};
        var i=users.length -1;
        users.forEach(function(user) {
            userMap[i] = user;
            i--;
        });
        res.send(userMap);
    })
};

exports.generateDummyUsers = function(){

        var User1 = new User({
            email: 'user1@email.com',
            created_at:Date.now(),
            updated_at:Date.now(),
            number_of_friends:'100',
            shared:false
        });
        var User2 = new User({
            email: 'user2@email.com',
            created_at:Date.now(),
            updated_at:Date.now(),
            number_of_friends:'50',
            shared:false
        });
        var User3 = new User({
            email: 'user3@email.com',
            created_at:Date.now(),
            updated_at:Date.now(),
            number_of_friends:'700',
            shared:false
        });
        User1.save(function (err) {
            if (err){
                console.log('User1 Did not make it');
            }
        });
        User2.save(function (err) {
            if (err){
                console.log('User2 Did not make it');
            }
        });
        User3.save(function (err) {
            if (err){
                console.log('User3 Did not make it'+err);
            }
        });

}