/**
 * Templates/Extensions manager. Powered by MEAN stack
 *
 * @link    http://github.com/nghuuphuoc/templatemanager
 * @author  http://twitter.com/nghuuphuoc
 */

var express = require('express'),
    app     = express(),
    server  = require('http').createServer(app),
    io      = require('socket.io').listen(server);

// Load configuration
var env    = process.env.NODE_ENV || 'development',
    config = require('./config/config')[env];

// Connect DB
var mongoose = require('mongoose');
mongoose.connect(config.db);

// Load models
var modelsPath = __dirname + '/app/models',
    fs         = require('fs');
fs.readdirSync(modelsPath).forEach(function(file) {
    if (~file.indexOf('.js')) {
        require(modelsPath + '/' + file);
    }
});

// Express settings
require('./config/express')(app, config);

// Load routes
require('./config/routes')(app);

// View helpers
app.locals({
    url: require('./app/helpers/url'),
    downloadable: require('./app/helpers/downloadable')
});

var socketConnections = {};
io.sockets.on('connection', function(socket) {
    socket.on('userName', function(userName) {
        if (userName) {
            socketConnections[userName] = socket;
            app.set('socketConnections', socketConnections);
        }
    });
});

// Listening
var port = process.env.PORT || 3000;
server.listen(port);
console.log('Start on port ' + port);

module.exports = app;