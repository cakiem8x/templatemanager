/**
 * Templates/Extensions manager. Powered by MEAN stack
 *
 * @link    http://github.com/nghuuphuoc/templatemanager
 * @author  http://twitter.com/nghuuphuoc
 */

var mongoose    = require('mongoose'),
    Membership  = mongoose.model('membership'),
    Package     = mongoose.model('package'),
    filesize    = require('filesize'),
    fs          = require('fs'),
    mkdirp      = require('mkdirp'),
    moment      = require('moment'),
    path        = require('path'),
    formidable  = require('formidable'),
    imageMagick = require('imagemagick');

/**
 * List packages
 */
exports.index = function(req, res) {
    var perPage   = 10,
        pageRange = 5,
        page      = req.param('page') || 1,
        q         = req.param('q') || '',
        year      = req.param('year'),
        type      = req.param('type'),
        sortBy    = req.param('sort') || '-created_date',
        criteria  = q ? { name: new RegExp(q, 'i') } : {};

    if (type) {
        criteria.type = type;
    }
    if (year) {
        criteria.year = year;
    }
    var sortCriteria = {}, sortDirection = ('-' == sortBy.substr(0, 1)) ? -1 : 1;

    sortBy = '-' == sortBy.substr(0, 1) ? sortBy.substr(1) : sortBy;
    sortCriteria[sortBy] = sortDirection;

    Package.count(criteria, function(err, total) {
        Package.find(criteria).sort(sortCriteria).skip((page - 1) * perPage).limit(perPage).populate('files').exec(function(err, packages) {
            if (err) {
                packages = [];
            }

            var numPages   = Math.ceil(total / perPage),
                startRange = (page == 1) ? 1 : pageRange * Math.floor((page - 1) / pageRange) + 1,
                endRange   = startRange + pageRange;

            if (endRange > numPages) {
                endRange = numPages;
            }

            res.render('package/index', {
                title: 'Packages',
                req: req,
                moment: moment,
                total: total,
                packages: packages,

                // Criteria
                q: q,
                criteria: criteria,
                sortBy: sortBy,
                sortDirection: sortDirection,

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
 * Add new package
 */
exports.add = function(req, res) {
    if ('post' == req.method.toLowerCase()) {
        var themes        = [],
            themeNames    = req.body['theme.name'],
            themeColors   = req.body['theme.color'],
            themeDemoUrls = req.body['theme.demo_url'];
        if (themeNames) {
            var numThemes = themeNames.length;
            for (var i = 0; i < numThemes; i++) {
                if (themeNames[i] && themeColors[i] && themeDemoUrls[i]) {
                    themes.push({
                        name: themeNames[i],
                        color: themeColors[i],
                        demo_url: themeDemoUrls[i]
                    });
                }
            }
        }

        var package = new Package({
            type: req.body.type || 'template',
            name: req.body.name,
            slug: req.body.slug,
            demo_url: req.body.demo_url,
            themes: themes,
            description: req.body.description,
            changelog: req.body.changelog,
            tags: req.body.tags,
            software_versions: req.body.software_versions,
            high_resolution: req.body.high_resolution,
            thumbs: JSON.parse(req.body.thumbs || '[]'),
            files: JSON.parse(req.body.uploaded_files || '[]'),
            responsive: req.body.responsive || false,
            free: req.body.free || false,
            memberships: req.body.memberships || [],
            year: req.body.year || new Date().getFullYear()
        });

        if (req.body.browsers) {
            package.browsers = req.body.browsers;
        }

        package.save(function(err) {
            if (err) {
                req.flash('error', 'Could not add package');
                return res.redirect('/admin/package/add');
            } else {
                req.flash('success', 'Package has been added successfully');
                return res.redirect('/admin/package/edit/' + package._id);
            }
        });
    } else {
        var config = req.app.get('config');
        Membership.find().exec().then(function(memberships) {
            res.render('package/add', {
                title: 'Add new package',
                messages: {
                    warning: req.flash('error'),
                    success: req.flash('success')
                },
                thumbPrefixUrl: config.thumbs.url,
                year: new Date().getFullYear(),
                memberships: memberships
            });
        });
    }
};

/**
 * Edit package
 */
exports.edit = function(req, res) {
    var id = req.param('id');
    Package.findOne({ _id: id }).populate('files').exec(function(err, package) {
        if ('post' == req.method.toLowerCase()) {
            var themes        = [],
                themeNames    = req.body['theme.name'],
                themeColors   = req.body['theme.color'],
                themeDemoUrls = req.body['theme.demo_url'];
            if (themeNames) {
                var numThemes = themeNames.length;
                for (var i = 0; i < numThemes; i++) {
                    if (themeNames[i] && themeColors[i] && themeDemoUrls[i]) {
                        themes.push({
                            name: themeNames[i],
                            color: themeColors[i],
                            demo_url: themeDemoUrls[i]
                        });
                    }
                }
            }

            package.type              = req.body.type || 'template';
            package.name              = req.body.name;
            package.slug              = req.body.slug;
            package.demo_url          = req.body.demo_url;
            package.themes            = themes;
            package.description       = req.body.description;
            package.changelog         = req.body.changelog;
            package.tags              = req.body.tags;
            package.software_versions = req.body.software_versions;
            package.browsers          = req.body.browsers;
            package.high_resolution   = req.body.high_resolution;
            package.thumbs            = JSON.parse(req.body.thumbs || '[]');
            package.files             = JSON.parse(req.body.uploaded_files || '[]');
            package.responsive        = req.body.responsive || false;
            package.free              = req.body.free || false;
            package.memberships       = req.body.memberships;
            package.year              = req.body.year || new Date().getFullYear();
            package.updated_date      = new Date();

            package.save(function(err) {
                if (err) {
                    req.flash('error', 'Could not save the package');
                } else {
                    req.flash('success', 'Package has been updated successfully');
                }
                return res.redirect('/admin/package/edit/' + id);
            });
        } else {
            Membership.find().exec().then(function(memberships) {
                var config = req.app.get('config');
                res.render('package/edit', {
                    title: 'Edit package',
                    messages: {
                        warning: req.flash('error'),
                        success: req.flash('success')
                    },
                    thumbPrefixUrl: config.thumbs.url,
                    package: package,
                    memberships: memberships,

                    // Helper
                    filesize: filesize
                });
            });
        }
    });
};

/**
 * Generate package slug
 */
exports.slug = function(req, res) {
    var package = new Package({
        _id: req.body.id,
        name: req.body.name
    });
    Package.generateSlug(package, function(slug) {
        res.json({
            slug: slug
        });
    });
};

/**
 * Suggest tags
 */
exports.tag = function(req, res) {
    // Cache the tags
    var config      = req.app.get('config'),
        redis       = require('redis'),
        redisClient = redis.createClient(config.redis.port || 6379, config.redis.host || '127.0.0.1'),
        cacheKey    = [config.redis.namespace, 'tags'].join(':');

    redisClient.get(cacheKey, function(err, reply) {
        if (reply) {
            return res.json(JSON.parse(reply));
        }

        Package.collection.distinct('tags', function(err, tags) {
            redisClient.set(cacheKey, JSON.stringify(tags));
            res.json(tags);
        });
    });
};

/**
 * Upload package thumbnail
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