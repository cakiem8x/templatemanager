var mongoose   = require('mongoose'),
    File       = mongoose.model('file'),
    fs         = require('fs'),
    filesize   = require('filesize'),
    mkdirp     = require('mkdirp'),
    moment     = require('moment'),
    path       = require('path'),
    formidable = require('formidable');

/**
 * Files management
 */
exports.index = function(req, res) {
    var perPage   = 10,
        pageRange = 5,
        page      = req.param('page') || 1,
        q         = req.param('q') || '',
        sortBy    = req.param('sort') || '-created_date',
        criteria  = q ? { '$or': [{ name: new RegExp(q, 'i') }, { description: new RegExp(q, 'i') }] } : {};

    var sortCriteria = {}, sortDirection = ('-' == sortBy.substr(0, 1)) ? -1 : 1;

    sortCriteria['-' == sortBy.substr(0, 1) ? sortBy.substr(1) : sortBy] = sortDirection;

    File.count(criteria, function(err, total) {
        File.find(criteria).sort(sortCriteria).skip((page - 1) * perPage).limit(perPage).select('uploaded_date num_downloads size description name').exec(function(err, files) {
            if (err) {
                files = [];
            }

            var numPages   = Math.ceil(total / perPage),
                startRange = (page == 1) ? 1 : pageRange * Math.floor((page - 1) / pageRange) + 1,
                endRange   = startRange + pageRange;

            if (endRange > numPages) {
                endRange = numPages;
            }

            res.render('file/index', {
                title: 'Files management',

                total: total,
                files: files,
                q: q,
                sortDirection: sortDirection,

                req: req,
                filesize: filesize,
                moment: moment,

                // Pagination
                page: page,
                numPages: numPages,
                startRange: startRange,
                endRange: endRange
            });
        });
    });
};

/**
 * Update description
 */
exports.desc = function(req, res) {
    var id = req.body.fid, description = req.body.desc;
    File.findOne({ _id: id }).exec(function(err, file) {
        if (err || !file) {
            return res.json({
                success: true
            });
        }
        file.description = description;
        file.save(function(err) {
            return res.json({
                success: !err
            });
        });
    });
};

/**
 * Search for files
 */
exports.search = function(req, res) {
    var perPage   = 10,
        pageRange = 5,
        page      = req.param('page') || 1,
        q         = req.param('q') || '',
        criteria  = q ? { '$or': [{ name: new RegExp(q, 'i') }, { description: new RegExp(q, 'i') }] } : {};

    File.count(criteria, function(err, total) {
        File.find(criteria).sort({
            uploaded_date: -1
        }).skip((page - 1) * perPage).limit(perPage).select('uploaded_date num_downloads size description name').exec(function(err, files) {
            if (err) {
                files = [];
            }

            var numPages   = Math.ceil(total / perPage),
                startRange = (page == 1) ? 1 : pageRange * Math.floor((page - 1) / pageRange) + 1,
                endRange   = startRange + pageRange;

            if (endRange > numPages) {
                endRange = numPages;
            }

            res.json({
                total: total,
                files: files,

                // Pagination
                page: page,
                numPages: numPages,
                startRange: startRange,
                endRange: endRange
            });
        });
    });
};

/**
 * Upload package files
 */
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
        userName          = req.session.user.username,
        currentFile       = null,
        fileId            = null;

    form.onPart = function(part) {
        // Because it's impossible to track upload progress for each individual file
        // So I have to overwrite the onPart() method to track the current upload file
        currentFile = part.filename;

        // Handle part as usual
        form.handlePart(part);
    };

    form
        .on('progress', function(bytesReceived, bytesExpected) {
            if (socketConnections && socketConnections[userName]) {
                var socket = socketConnections[userName];
                socket.emit('uploadProgress', {
                    progress: 100 * bytesReceived / bytesExpected + '%',
                    filename: currentFile
                });
            }
        })
        .on('field', function(name, value) {
            if ('fid' == name) {
                fileId = value;
            }
        })
        .on('file', function(name, file) {
            // file contains size, path, name, lastModifiedDate properties
            var now  = new Date(),
                dir  = path.join(config.upload.dir, String(now.getFullYear()), String(now.getMonth() + 1)),
                name = file.name.replace(/^\.+/, '').replace(/\s+/g, '_');
            if (!fs.existsSync(dir)) {
                mkdirp.sync(dir);
            }

            // Prevent overwriting existing files
            while (fs.existsSync(dir + '/' + name)) {
                name = name.replace(/(?:(?:_\(([\d]+)\))?(\.[^.]+))?$/, function(s, index, ext) {
                    return '_(' + ((parseInt(index, 10) || 0) + 1) + ')' + (ext || '');
                });
            }

            var filePath = path.join(dir, name);
            fs.rename(file.path, filePath, function() {
                File.findOne({ _id: fileId }).exec(function(err, fileModel) {
                    if (err || !fileModel) {
                        fileModel = new File();
                    }
                    fileModel.name          = file.name;
                    fileModel.path          = filePath;
                    fileModel.size          = file.size;
                    fileModel.last_modified = new Date(file.lastModifiedDate).getTime();
                    fileModel.uploaded_date = now.getTime();
                    fileModel.uploaded_user = req.session.user.username;

                    fileModel.save(function(err) {
                        res.end(JSON.stringify({
                            files: err ? [] : [{
                                // TODO: Does Mongoose support to get model properties?
                                _id: fileModel._id,
                                name: fileModel.name,
                                size: fileModel.size,
                                num_downloads: fileModel.num_downloads
                            }]
                        }));
                    });
                });
            });
        })
        .on('error', function(e) {
        })
        .on('end', function() {
            res.writeHead(200, {
                'Content-Type': req.headers.accept.indexOf('application/json') !== -1 ? 'application/json' : 'text/plain'
            });
        })
        .parse(req);
};