var express = require('express'),
    app     = express(),
    server  = require('http').createServer(app),
    io      = require('socket.io').listen(server);

// Load configuration
var env    = process.env.NODE_ENV || 'development',
    config = require('./config/config')[env];

// Express settings
require('./config/express')(app, config);

// Load routes
require('./config/routes')(app);

// Listening
var port = process.env.PORT || 3000;
server.listen(port);
console.log('Start on port ' + port);

module.exports = app;