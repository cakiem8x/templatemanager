var mongoose    = require('mongoose'),
    Template    = mongoose.model('template'),
    fs          = require('fs'),
    mkdirp      = require('mkdirp'),
    moment      = require('moment'),
    path        = require('path'),
    formidable  = require('formidable'),
    imageMagick = require('imagemagick');

/**
 * List templates
 */
exports.index = function(req, res) {
    var perPage   = 10,
        pageRange = 5,
        page      = req.param('page') || 1,
        q         = req.param('q') || '',
        criteria  = q ? { name: new RegExp(q, 'i') } : {};

    Template.count(criteria, function(err, total) {
        Template.find(criteria).skip((page - 1) * perPage).limit(perPage).exec(function(err, templates) {
            if (err) {
                templates = [];
            }

            var numPages   = Math.ceil(total / perPage),
                startRange = (page == 1) ? 1 : pageRange * Math.floor(page / pageRange) + 1,
                endRange   = startRange + pageRange;

            if (endRange > numPages) {
                endRange = numPages;
            }

            res.render('template/index', {
                req: req,
                moment: moment,
                title: 'Templates',
                total: total,
                templates: templates,
                q: q,

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
 * Add new template
 */
exports.add = function(req, res) {
    if ('post' == req.method.toLowerCase()) {
        var template = new Template({
            name: req.body.name,
            demo_url: req.body.demo_url,
            description: req.body.description,
            tags: req.body.tags,
            thumbs: JSON.parse(req.body.thumbs || []),
            files: JSON.parse(req.body.uploaded_files || []),
            responsive: req.body.responsive || true,
            free: req.body.free || false,
            year: req.body.year || new Date().getFullYear()
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
        var config = req.app.get('config');
        res.render('template/add', {
            messages: {
                warning: req.flash('error'),
                success: req.flash('success')
            },
            thumbPrefixUrl: config.thumbs.url,
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

    var files = {};
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

            var finish = function() {
                for (var type in config.thumbs.versions) {
                    if (!files[type]) {
                        return;
                    }
                }

                res.json({
                    files: files
                });
            };

            // Generate thumbnails
            var fileNameWithoutExt = fileName.substring(0, fileName.length - ext.length),
                originalFilePath   = path.join(dir, fileName);
            fs.rename(file.path, originalFilePath, function(err) {
                if (!err) {
                    // Store the original thumb
                    files['original'] = '/' + [year, month, fileName].join('/');

                    for (var type in config.thumbs.versions) {
                        (function(type) {
                            var method    = config.thumbs.versions[type][0],
                                width     = config.thumbs.versions[type][1],
                                thumbFile = fileNameWithoutExt + '_' + type + ext;

                            if ('crop' == method) {
                                imageMagick.crop({
                                    width: width,
                                    height: width,
                                    srcPath: originalFilePath,
                                    dstPath: path.join(dir, thumbFile)
                                }, function() {
                                    files[type] = '/' + [year, month, thumbFile].join('/');
                                    finish();
                                });
                            } else if ('resize' == method) {
                                imageMagick.resize({
                                    width: width,
                                    srcPath: originalFilePath,
                                    dstPath: path.join(dir, thumbFile)
                                }, function() {
                                    files[type] = '/' + [year, month, thumbFile].join('/');
                                    finish();
                                });
                            }
                        }(type));
                    }
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