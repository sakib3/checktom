var https = require('https');
var fs = require('fs');

var options = {
    key: fs.readFileSync('ssl/check-key.pem'),
    cert: fs.readFileSync('ssl/checktom-cert.pem'),
    ca: fs.readFileSync('ssl/check-csr.pem')
};

https.createServer(options, function (req, res) {
    res.writeHead(200);
    res.end("hello world\n");
}).listen(8000);