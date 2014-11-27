module.exports = function () {
    switch (process.env.NODE_ENV) {
        case 'development':
            return {
                env: 'development',

                root: require('path').normalize(__dirname + '/..'),

                app: {
                    name: 'CHECKTOM'
                },

                db: 'mongodb://localhost/checktombeta',

                port: process.env.PORT,

                facebook: {
                    clientID: "809566932407524",
                    clientSecret: "04ab4aa4c63300a631e4b47687b31ebf",
                    callbackURL: "http://localhost:3000/auth/facebook/callback"
                },

                mail: {
                    service: "Gmail2",
                    auth: {
                        user: "checktomalpha@gmail.com",
                        pass: "ALPHA@Dev"
                    }
                }
            };
        // 1462750630610152 appid
          // secret ee82b50ee53f154825971dfd5893a42b
        case 'production':
            return {
                env: 'production',

                root: require('path').normalize(__dirname + '/..'),

                app: {
                    name: 'CHECKTOM'
                },

                db: 'mongodb://nodejitsu:93257f241f4521954ca5255e2b93f509@dharma.mongohq.com:10074/nodejitsudb6603742809',

                port: process.env.PORT,

                facebook: {
                    clientID: "809566932407524",
                    clientSecret: "04ab4aa4c63300a631e4b47687b31ebf",
                    callbackURL: "https://checktomtest.nodejitsu.com/auth/facebook/callback"
                },

                mail: {
                    service: "Gmail2",
                    auth: {
                        user: "wowhewow@gmail.com",
                        pass: ""
                    }
                }
            };

        case 'test':
            return {};

        default:
            return {};
    }
};