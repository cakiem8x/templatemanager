var mongoose   = require('mongoose'),
    Template   = mongoose.model('template'),
    fs         = require('fs'),
    formidable = require('formidable');

exports.index = function(req, res) {
    res.render('template/index', {
        title: 'Templates'
    });
};

exports.add = function(req, res) {
    res.render('template/add', {
        title: 'Add new template'
    });
};

exports.upload = function(req, res) {
    var app    = req.app,
        config = app.get('config');

    var form = new formidable.IncomingForm({
        keepExtensions: true,
        uploadDir: config.upload.dir,
        maxFieldsSize: config.upload.maxSize
    });

    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.setHeader('Content-Disposition', 'inline; filename="files.json"');

    var socketConnections = app.get('socketConnections'),
        userName          = req.session.user_name,
        files             = [];

    form
        .on('progress', function(bytesReceived, bytesExpected) {
            if (socketConnections && socketConnections[userName]) {
                var socket = socketConnections[userName];
                socket.emit('uploadProgress', 100 * bytesReceived / bytesExpected + '%');
            }
        })
        .on('file', function(name, file) {
            console.log(name, file);
            files.push(file);
        })
        .on('error', function(e) {
        })
        .on('end', function() {
            res.writeHead(200, {
                'Content-Type': req.headers.accept.indexOf('application/json') !== -1 ? 'application/json' : 'text/plain'
            });
            res.end(JSON.stringify(files));
        })
        .parse(req);
};