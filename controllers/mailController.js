var userController = require('../controllers/userController');
var nodemailer = require('nodemailer');
var mongoose = require('mongoose'),
    User = mongoose.model('User');
// create reusable transport method (opens pool of SMTP connections)
var smtpTransport = nodemailer.createTransport("SMTP", {
    service: "Gmail",
    auth: {
        user: "noreply.checktom@gmail.com",
        pass: "Checktom123"
    }
});
var validateAttri = function (attribute) {
    if (typeof attribute !== 'undefined'
        && attribute !== null
        && attribute !== '' && attribute !== 'undefined') {
        return true;
    } else {
        return false;
    }
}
// static variables and functions
var saltReset = "hjklokdkdajswrj";
var saltVerifyAccount = "kjhlokdkdajswrj";

exports.SendRecoverPassword = function (req, res) {
    // to req.body.email {email:value}
    var ResetEmail = req.body.email
    // check if its an FB email
    User.find({email: ResetEmail}, function (err, docs) {
        if (err) {
            console.log("error" + error);
        } else {
            console.log("account found")
            console.log(!validateAttri(docs[0].facebook));
            if (!validateAttri(docs[0]['facebook'])) {
                // get the resetlink from DB
                console.log(docs[0]);
                console.log("Trying to send recover password mail");
                console.log(docs[0].uniqueRecoveryString);
                var unique_verification_link = 0 + "&d&lt&" + saltReset + "&d&lt&" + docs[0].uniqueRecoveryString;
                var OurURL = "https://checktomtest.nodejitsu.com/resetPassword/#";
                var emailPlaintext = "Hello "+docs[0].name+"! You have requested a password reset! click here to reset your account. " + OurURL + unique_verification_link;
                var mailOptions = {
                    from: "noreply.checktom@gmail.com", // sender address
                    to: ResetEmail, // list of receivers
                    subject: "Password Recovery", // Subject line
                    text: emailPlaintext // plaintext body
                }

                console.log("sending mail");
                smtpTransport.sendMail(mailOptions, function (error, response) {
                    if (error) {
                        console.log("error" + error);
                    } else {
                        console.log("Message sent: " + response.message);
                    }
                    smtpTransport.close();
                    res.send(200);
                });
            } else {
                console.log("account is a FB account");
                res.send(400, "Facebook account");
            }
        }
    })
}
// registers a user, and sends a verification mail.
exports.registrationMailSend = function (user) {
    var OurURL = "http://localhost:3000/verify/";
    //var OurUrl = "http://checktomtest.nodejitsu.com/verify/";

    // Create all purpose links
    var unique_verification_link = 0 + "&d&lt&" + saltVerifyAccount + "&d&lt&" + user.uniqueRecoveryString;

    // Create mail content
    var emailPlaintext = "Welcome to checktom ! click here to verify your account. " + OurURL + unique_verification_link;

    // send email to users email with verification link.
    var mailOptions = {
        from: "checktommailservice@gmail.com", // sender address
        to: user.email, // list of receivers
        subject: "Welcome to Checktom!", // Subject line
        text: emailPlaintext // plaintext body
    }


    // send mail with defined transport object
    smtpTransport.sendMail(mailOptions, function (error, response) {
        if (error) {
            console.log(error);
        } else {
            console.log("Message sent: " + response.message);
        }
        // if you don't want to use this transport object anymore, uncomment following line
        smtpTransport.close(); // shut down the connection pool, no more messages
    });


}
// takes a string url as input. in the format supplied in a mail.
exports.VerifyLink = function (req, res) {
    // takes the link supplied in url
    var uniqueKey = req.params.key;
    var delimited = uniqueKey.split("((d)lt)");
    // identifies the salttype and number.
    var salt = delimited[1];
    var number = delimited[2];

    // start one of the two processes, depending on salttype.
    if (salt === saltReset) {
        /* console.log("reset Password called");

         // Get the new password from the post request.
         var newPassword = Req.body.password;

         // confirmation sent to user. either on-page or email.


         // resetpassword...

         // a resetpassword page is opened. with two inputs.

         // if both fields match the value is used to overwrite old password.
         var query = {uniqueRecoveryString: number};
         User.findOneAndUpdate(query, { password: newPassword }, function (err, stuff) {
         console.log(stuff);
         })
         res.send(200);
         */
    }
    else if (salt === saltVerifyAccount) {
        // set verified to "true" and save in db.
        var query = { uniqueRecoveryString: number };
        // verification here
        User.findOneAndUpdate(query, { verified: true }, function (err, stuff) {
            console.log(stuff);
        })
        res.send(200);
    }
}