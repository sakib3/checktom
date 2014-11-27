var express = require('express'),
    http = require('http'),
    https = require('https'),
    tls = require('tls'),
    path = require('path'),
    fs = require('fs'),

    mongoose = require('mongoose'),
    passport = require('passport'),

// storing sessions in database with connect-mongo
    mongoStore = require('connect-mongo')(express),
    flash = require('connect-flash'),

// all db models are in App/models folder
    models_path = __dirname + '/models',

// setting up config environments for development and production
    config = require('./config/config'),
    config = new config();


// Loading all models in dir '/models'
fs.readdirSync(models_path).forEach(function (file) {
    require(models_path + '/' + file)
})

var app = module.exports = express();

app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// for using partials layout
app.set('view options', {
    layout: false
});
app.use(express.favicon(path.join(__dirname, 'public/assets/img/favicon.ico'), { maxAge: 2592000000 }));
///////// custom force SSL using load balancer header x-forwarded-proto



/////////



app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser('CT2013@Dev'));

// use express mongo session storage
app.use(express.session({
    secret: 'CT2013@Dev',
    clear_interval: 900,
    cookie: { maxAge: 2 * 60 * 60 * 1000 },
    store: new mongoStore({
        url: config.db,

        collection: 'sessions'
    })
}));

app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

app.use(express.static(path.join(__dirname, 'public')));

// set max age for images folder
app.use(express.static(path.join(__dirname, 'public/img'), { maxAge: 31557600000 }));

if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}else{

    var parseUrl = require('url').parse;
    app.use(function (req, res, next) {
        if (!req.secure && (req.get('X-Forwarded-Proto') !== 'https'))
        {
            var httpsPort = req.app.get('httpsPort') || 443;
            var fullUrl = parseUrl('http://' + req.header('Host') + req.url);
            res.redirect('https://' + fullUrl.hostname + ':' + httpsPort + req.url);
        } else {
            next();
        }
    });
}

console.log(process.env.NODE_ENV);

// Requiring all the routes in dir 'routes/'(Parameters: app, auth and passport modules)
var routes = require('./routes')(app, passport);
require('./config/passport')(passport, config);

app.use(app.router);

// Connecting to mongodb
mongoose.connect(config.db);

// Setting up error pages (https://github.com/visionmedia/express/tree/master/examples/error-pages)
app.use(function (req, res, next) {
    res.status(404);

    // respond with html page
    if (req.accepts('html')) {
        res.render('404', { url: req.url });
        return;
    }

    // respond with json
    if (req.accepts('json')) {
        res.send({ error: 'Not found' });
        return;
    }

    // default to plain-text. send()
    res.type('txt').send('Not found');
});
app.use(function (err, req, res, next) {
    // we may use properties of the error object
    // here and next(err) appropriately, or if
    // we possibly recovered from the error, simply next().
    res.status(err.status || 500);
    res.render('500', { error: err });
});


// http to https redirect nodejs


//
var HttpsOptions = {
    key: fs.readFileSync('ssl/check-key.pem'),
    cert: fs.readFileSync('ssl/checktom-cert.pem')
};
// Creating a server instance and listening to the port
var server = http.createServer(app).listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});

/*
 https.createServer(HttpsOptions,app).listen(443, function () {
 console.log('Express server listening on port ' + 443);
 });*/



//     chat io       ---------------------------
var io = require('socket.io').listen(server),
    Chat = mongoose.model('chat');
users = {};
userdata=[];

io.sockets.on('connection', function (socket) {
    console.log("A NEW CONNECTIO NWAS MADEAs");
    console.log("A NEW CONNECTIO NWAS MADEAs");console.log("A NEW CONNECTIO NWAS MADEAs");console.log("A NEW CONNECTIO NWAS MADEAs");console.log("A NEW CONNECTIO NWAS MADEAs");



    // chat find, messages from specific username
    // equal to articleAuthor or IsInterestedCheckboxName

    /*Chat.find({}, function (err, docs) {
     if (err) throw err;
     console.log('Sending old msg!');
     socket.emit('load old msgs', docs);
     });*/

    //limit the query: get last 8 conversation
    //var query = Chat.find({});
    //query.sort('-created').limit(8).exec(function(err,docs){});
    socket.on('load old msgs', function (data){
        Chat.find({atricleid:data}, function (err, docs) {
            if (err) throw err;
            console.log('Sending old msg!');
            socket.emit('load old msgs', docs);
        });
    });
    socket.on('new user', function (data, callback) {
        //console.log(data);
        console.log('::::::::::::::::'+'  event : new user  '+'::::::::::::::::');
        if (data.user in users) {
            console.log('user exist!!!');
            console.log('callback false');
            callback(false);
        } else {

            callback(true);
            socket.nickname = data.user;
            console.log('new user found');
            users[socket.nickname] = socket;
            userdata.push({ "username": data.user, "search_article_id": data.search_article_id});
            updateNicknames();
            console.log('User: '+data.user+' created has searched the article id: '+data.search_article_id);
        }
        console.log('::::::::::::::::'+'  end  '+'::::::::::::::::');
    });

    function updateNicknames() {
        console.log('Update Nicknames');
        io.sockets.emit('usernames', userdata);
        console.log(userdata.length+' users are online');
    }

    //send message
    socket.on('send message', function (data, callback) {
        //remove the whitespace
        if (!socket.nickname || socket.nickname === undefined) return;
        var socket_nick = socket.nickname;
        var msg = data.trim();
        console.log('msg:  '+msg);
        //console.log(msg);
        //if first three char is matched then whispering
        if (msg.substr(0, 1) === '#') {
            msg = msg.substr(1);
            //get the index of the space, after whisper name then space and then msg
            var ind = msg.indexOf('#');
            if (ind !== -1) {
                var name = msg.substring(0, ind);
                var msg = msg.substring(ind + 1);
                var ind2 = msg.indexOf('#');
                var article_id = msg.substring(0,ind2);
                var msg = msg.substring(ind2 + 1);
                console.log('name:  '+name);
                console.log('article_id:  '+article_id);
                console.log('msg:  '+msg);
                //console.log(users);
                console.log(name in users);

                console.log("we got in");
                //msg.length >0 to avoid unwanted msg
                if(msg.length>0){
                    if(name in users){
                        var newMsg = new Chat({ msg: msg, to: name, nick: socket_nick,atricleid:article_id});
                        console.log(newMsg);
                        newMsg.save(function (err,doc) {
                            if (err)
                                throw err;

                            //unicast the received msg to the receiver
                            //send msg or emits only if name exists in the socket
                            if(name in users)
                            users[name].emit('new message', {_id:doc._id, msg: msg, to: name, nick: socket_nick,atricleid:article_id });
                            //unicast the received msg to the sender to have his copy
                            //send msg or emits only if socket_nick exists in the socket
                            if(socket_nick in users)
                            users[socket_nick].emit('new message', {_id:doc._id, msg: msg, to: name, nick: socket_nick,atricleid:article_id });

                            //broadcast the received msg to all including the sender
                            //io.sockets.emit('new message', { msg: msg, to: name, nick: socket.nickname });
                        });
                    } else{

                        console.log('User is not online so message is sent to his mail box/notification box');
                        var newMsg = new Chat({ msg: msg, to: name, nick: socket_nick,atricleid:article_id });
                        console.log(newMsg);
                        newMsg.save(function (err,doc) {
                            if (err)
                                throw err;

                            //unicast the received msg to the receiver
                            //users[name].emit('new message', { msg: msg, to: name, nick: socket.nickname });
                            //unicast the received msg to the sender to have his copy
                            //send msg or emits only if socket_nick exists in the socket
                            if(socket_nick in users)
                            users[socket_nick].emit('new message', {_id:doc._id, msg: msg, to: name, nick: socket_nick,atricleid:article_id });

                            //broadcast the received msg to all including the sender
                            //io.sockets.emit('new message', { msg:msg, nick:socket.nickname });
                        });
                    }
                }else{
                    console.log('Else start here');
                    console.log('msg length less than 1');
                    console.log(data.trim());
                    console.log('Else end here');

                }


                //console.log('Whisper!');


            } else {
                callback('Error! Please enter a message for your Whisper.');
            }

        } else {
            callback('Error! Please select a user.');

        }

    });
    //user logged in first time get notification
    socket.on('notifications', function(data,callback){
        //users[socket.nickname].emit('usernames', userdata);
        Chat
            //.where({'atricleid':articleID})
            .find(  { $and: [  {'read':false },{'to':data }  ] } )
            //.select('to nick atricleid')
            //.find()
            .lean(false)
            .exec(function (err, docs){
                if (err) throw err;
                console.log('notification query');
                console.log(docs);
                callback(docs);
            });

    });
    //Whenever a user disconnect from the server then this events emit
    socket.on('disconnect', function (data) {
        console.log(data);
        if (!socket.nickname) return;
        //remove that clinet from the object
        delete users[socket.nickname];
        for(key in userdata){
            if( (userdata[key]).username===socket.nickname ){
                userdata.splice(key, 1);
            }

        }
        updateNicknames();
        console.log(socket.nickname +' is left from the chat....');

    });
    socket.on('userlist request', function(data){
        //users[socket.nickname].emit('usernames', userdata);
        io.sockets.emit('usernames', userdata);
        console.log(userdata.length+' users are online');
        console.log(Object.keys(users));
    });
    socket.on('update search_article_id', function(data){
        console.log('in update search_article_id');
        console.log('socket.nickname: '+socket.nickname);
        console.log('userdata.length: '+userdata.length);
        for(var i = 0; i < userdata.length; i++) {
            if(userdata[i].username === socket.nickname) {

                userdata[i].search_article_id=data.search_article_id;
                console.log('User: '+socket.nickname+' changed search_article_id to : '+data.search_article_id);

            }
        }

    });
    socket.on('set msg read flag', function (data){
        console.log('set msg read flag');
        var doc_id=data._id;

        if(typeof (data.all)!='undefined' && data.all==true){
            var query = { _id: doc_id };
            Chat.findOne(query,function (err, docs){
                if (err) throw err;
                console.log(docs);
                var newquery ={atricleid:docs.atricleid,nick:docs.nick,to:docs.to};
                console.log(newquery);
                Chat.update(newquery, { $set: { read: true }},{multi: true}, function (err, updatedata){
                    if (err) throw err;

                });

            });
        }
        else{
            var query = { _id: doc_id };
            Chat.findOneAndUpdate(query, { read: data.read },function (err, docs){
                if (err) throw err;

            });
        }



    });
});



