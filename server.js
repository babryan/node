var Particle = require('particle-api-js');
var particle = new Particle();
var token = "a8ebcfb163d4291e6041e42d0da48771bc23f3c2";
var http = require('http');
var qs = require('querystring');
var fs = require('fs');
var formOutput = fs.readFileSync("form.html");
var serverPort = 8124;
http.createServer(function (request, response) {
    if (request.method === "GET") {
        if (request.url === "/favicon.ico") {
            response.writeHead(404, { 'Content-Type': 'text/html' });
            response.write('<!doctype html><html><head><title>404</title></head><body>404: Resource Not Found</body></html>');
            response.end();
        } else {
            response.writeHead(200, { 'Content-Type': 'text/html' });
            response.end(formOutput);
        }
    } else if (request.method === "POST") {
        if (request.url === "/inbound") {
            var requestBody = '';
            request.on('data', function (data) {
                requestBody += data;
                if (requestBody.length > 1e7) {
                    response.writeHead(413, 'Request Entity Too Large', { 'Content-Type': 'text/html' });
                    response.end('<!doctype html><html><head><title>413</title></head><body>413: Request Entity Too Large</body></html>');
                }
            });
            request.on('end', function () {
                var formData = qs.parse(requestBody);
                response.writeHead(200, { 'Content-Type': 'text/html' });
                response.end(formOutput);

                var arg = formData.led + ":" + formData.red + ":" + formData.green + ":" + formData.blue;

                var fnPr = particle.callFunction({ deviceId: 'mutant_dozen', name: 'setLED', argument: arg, auth: token });

                fnPr.then(
                    function (data) {
                        console.log('Function called succesfully:', data);
                    }, function (err) {
                        console.log('An error occurred:', err);
                    });
            });
        } else {
            response.writeHead(404, 'Resource Not Found', { 'Content-Type': 'text/html' });
            response.end('<!doctype html><html><head><title>404</title></head><body>404: Resource Not Found</body></html>');
        }
    } else {
        response.writeHead(405, 'Method Not Supported', { 'Content-Type': 'text/html' });
        return response.end('<!doctype html><html><head><title>405</title></head><body>405: Method Not Supported</body></html>');
    }
}).listen(serverPort);
console.log('Server running at localhost:' + serverPort);