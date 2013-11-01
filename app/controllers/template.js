var mongoose   = require('mongoose'),
    Template   = mongoose.model('template'),
    fs         = require('fs'),
    formidable = require('formidable'),
    config     = require('../../config/config')[process.env.NODE_ENV || 'development'];

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
    var form = new formidable.IncomingForm();

    // This does not seem to work
    // It always upload to the temp dir
    form.uploadDir     = config.upload.dir;

    form.maxFieldsSize = config.upload.maxSize;

    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.setHeader('Content-Disposition', 'inline; filename="files.json"');

//    form.on('progress', function(bytesReceived, bytesExpected) {
//            console.log('bytesExpected:', bytesExpected);
//            console.log('Uploaded ' + 100 * bytesReceived / bytesExpected + '%');
//        });
//    form.on('field', function(name, value) {
//        res.send('----' + name + value);
//            console.log('field:', name, value);
//        })
//        .on('fileBegin', function(name, file) {
//            console.log('fileBegin:', name, file);
//        })
//        .on('error', function(err) {
//            console.log(err);
//        });

    var files = [];

    form
        .on('file', function(name, file) {
            files.push(file);
        })
        .on('error', function(e) {
            console.log(e);
        })
        .on('end', function() {
            res.writeHead(200, {
                'Content-Type': req.headers.accept.indexOf('application/json') !== -1 ? 'application/json' : 'text/plain'
            });
            res.end(JSON.stringify(files));
        })
        .parse(req);
};