var mongoose      = require('mongoose'),
    TemplateModel = mongoose.model('template'),
    fs            = require('fs'),
    mkdirp        = require('mkdirp'),
    path          = require('path'),
    formidable    = require('formidable'),
    imageMagick   = require('imagemagick');

/**
 * List templates
 */
exports.index = function(req, res) {
    res.render('template/index', {
        title: 'Templates'
    });
};

/**
 * Add new template
 */
exports.add = function(req, res) {
    if ('post' == req.method.toLowerCase()) {
        var template = new TemplateModel({
            name: req.body.name,
            demo_url: req.body.demo_url,
            description: req.body.description,
            tags: req.body.tags,
            thumbs: req.body.thumbs,
            files: JSON.parse(req.body.uploaded_files || []),
            responsive: req.body.responsive || true,
            free: req.body.free || false
        });
        template.save(function(err) {
            if (err) {
                req.flash('error', 'Could not add template');
                return res.redirect('/admin/template/add');
            } else {
                req.flash('success', 'Template has been added successfully');
                return res.redirect('/admin/template/add');
            }
        });
    } else {
        res.render('template/add', {
            messages: {
                warning: req.flash('error'),
                success: req.flash('success')
            },
            title: 'Add new template',
            year: new Date().getFullYear()
        });
    }
};

/**
 * Upload template thumbnail
 */
exports.thumb = function(req, res) {
    var app    = req.app,
        config = app.get('config');

    var form = new formidable.IncomingForm({
        keepExtensions: true,
        uploadDir: config.thumbs.dir
    });

    var files = [];
    form
        .on('file', function(name, file) {
            var now   = new Date(),
                year  = String(now.getFullYear()),
                month = String(now.getMonth() + 1),
                dir   = path.join(config.thumbs.dir, year, month);
            if (!fs.existsSync(dir)) {
                mkdirp.sync(dir);
            }

            var fileName = path.basename(file.path), ext = path.extname(file.path);
            // Prevent overwriting existing files
            while (fs.existsSync(dir + '/' + fileName)) {
                fileName = fileName.replace(/(?:(?:_\(([\d]+)\))?(\.[^.]+))?$/, function(s, index, ext) {
                    return '_(' + ((parseInt(index, 10) || 0) + 1) + ')' + (ext || '');
                });
            }

            // Generate thumbnails
            var fileNameWithoutExt = fileName.substring(0, fileName.length - ext.length);
            for (var type in config.thumbs.versions) {
                var method    = config.thumbs.versions[type][0],
                    width     = config.thumbs.versions[type][1],
                    thumbFile = fileNameWithoutExt + '_' + type + ext;

                if ('crop' == method) {
                    console.log('cropping ', file.path, path.join(dir, thumbFile));
                    imageMagick.crop({
                        width: width,
                        height: width,
                        srcPath: file.path,
                        dstPath: path.join(dir, thumbFile)
                    }, function() {
                        files[type] = '/' + [year, month, thumbFile].join('/');
                    });
                } else if ('resize' == method) {
                    console.log('resizing ', file.path, path.join(dir, thumbFile));
                    imageMagick.resize({
                        width: width,
                        srcPath: file.path,
                        dstPath: path.join(dir, thumbFile)
                    }, function() {
                        files[type] = '/' + [year, month, thumbFile].join('/');
                    });
                }
            }

            // Store the original thumb
            fs.rename(file.path, path.join(dir, fileName), function(err) {
                if (!err) {
                    files['original'] = '/' + [year, month, fileName].join('/');

                    res.writeHead(200, {
                        'Content-Type': req.headers.accept.indexOf('application/json') !== -1 ? 'application/json' : 'text/plain'
                    });
                    res.end(JSON.stringify({
                        files: files
                    }));
                }
            });
        })
        .parse(req);
};

/**
 * Upload template files
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
            // file contains size, path, name, lastModifiedDate properties
            var now = new Date(),
                dir = path.join(config.upload.dir, String(now.getFullYear()), String(now.getMonth() + 1));
            if (!fs.existsSync(dir)) {
                mkdirp.sync(dir);
            }

            var name = file.name.replace(/^\.+/, '').replace(/\s+/g, '_');
            // Prevent overwriting existing files
            while (fs.existsSync(dir + '/' + name)) {
                name = name.replace(/(?:(?:_\(([\d]+)\))?(\.[^.]+))?$/, function(s, index, ext) {
                    return '_(' + ((parseInt(index, 10) || 0) + 1) + ')' + (ext || '');
                });
            }

            files.push({
                name: file.name,
                path: path.join(dir, name),
                size: file.size,
                last_modified: new Date(file.lastModifiedDate).getTime(),
                uploaded_date: now.getTime()
            });

            fs.rename(file.path, path.join(dir, name));
        })
        .on('error', function(e) {
        })
        .on('end', function() {
            res.writeHead(200, {
                'Content-Type': req.headers.accept.indexOf('application/json') !== -1 ? 'application/json' : 'text/plain'
            });
            res.end(JSON.stringify({
                files: files
            }));
        })
        .parse(req);
};