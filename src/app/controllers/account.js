/**
 * Templates/Extensions manager. Powered by MEAN stack
 *
 * @link    http://github.com/nghuuphuoc/templatemanager
 * @author  http://twitter.com/nghuuphuoc
 */

var
    // For authentication
    http = require('http'),
    url  = require('url'),
    qs   = require('querystring'),

    mongoose   = require('mongoose'),
    Download   = mongoose.model('download'),
    Membership = mongoose.model('membership'),
    Package    = mongoose.model('package'),
    fs         = require('fs'),
    filesize   = require('filesize'),
    moment     = require('moment');

/**
 * Sign in
 */
exports.signin = function(req, res) {
    // Redirect to the account dashboard when authenticated account tries to access the sign in page
    if (req.session.account) {
        return res.redirect('/account');
    }

    var app         = req.app,
        config      = app.get('config'),
        apiEndpoint = url.parse(config.amember.url);

    if ('post' == req.method.toLowerCase()) {
        // Validate form
        if (!req.body.user_name || !req.body.password) {
            req.flash('error', 'Username and password are required');
            return res.redirect('/account/signin');
        }

        var data = qs.stringify({
                _key: config.amember.key,
                login: req.body.user_name,
                pass: req.body.password
            }),
            options = {
                host: apiEndpoint.host,
                port: apiEndpoint.port || 80,
                path: (apiEndpoint.path == '/' ? '' : apiEndpoint.path) + '/api/check-access/by-login-pass?' + data,
                method: 'GET'
            };
        var result = {
                ok: false,
                error: null,
                message: null
            },
            body    = '',
            request = http.request(options, function(response) {
                response.setEncoding('utf8');
                response.on('data', function(chunk) {
                    body += chunk;
                });
                response.on('end', function() {
                    result = JSON.parse(body);

                    var redirect = function() {
                        if (req.session.returnTo) {
                            var to = req.session.returnTo;
                            delete req.session.returnTo;
                            return res.redirect(to);
                        }
                        return res.redirect('/account');
                    };

                    if (result.ok == true || result.ok == 'true') {
                        req.session.account = req.body.user_name;

                        // Get account subscriptions
                        if (result.subscriptions) {
                            var pids = [];
                            for (var pid in result.subscriptions) {
                                pids.push(pid);
                            }
                            Membership.find({ pid: { $in: pids } }).exec(function(err, memberships) {
                                var subscriptions = [];
                                if (!err && memberships) {
                                    for (var i in memberships) {
                                        subscriptions.push({
                                            _id: memberships[i]._id,
                                            title: memberships[i].title,
                                            pid: memberships[i].pid,
                                            expiration: result.subscriptions[memberships[i].pid] ? result.subscriptions[memberships[i].pid] : null
                                        });
                                    }
                                }
                                req.session.subscriptions = subscriptions;
                                return redirect();
                            });
                        } else {
                            req.session.subscriptions = [];
                            return redirect();
                        }
                    } else {
                        req.flash('error', result.message || result.msg);
                        return res.redirect('/account/signin');
                    }
                });
            });
        request.on('error', function(e) {
            req.flash('error', e.message);
            res.redirect('/account/signin');
        });
        request.end();
    } else {
        res.render('account/signin', {
            messages: {
                warning: req.flash('error'),
                success: req.flash('success')
            },
            title: 'Sign in',
            registerUrl: config.provider.registerUrl,
            frontEndUrl: config.url.frontEnd || req.protocol + '://' + req.get('host')
        });
    }
};

/**
 * Sign out
 */
exports.signout = function(req, res) {
    if (req.session.account) {
        delete req.session.account;
        delete req.session.subscriptions;
        res.redirect('/account/signin');
    } else {
        res.redirect('/');
    }
};

/**
 * Dashboard
 */
exports.dashboard = function(req, res) {
    var config = req.app.get('config');

    res.render('account/dashboard', {
        title: 'Dashboard',
        subscriptions: req.session.subscriptions,
        moment: moment,
        purchaseUrl: config.provider.registerUrl,
        frontEndUrl: config.url.frontEnd || req.protocol + '://' + req.get('host'),
        downloadUrl: config.url.download || req.protocol + '://' + req.get('host')
    });
};

/**
 * Show account's recent downloads
 */
exports.recentDownloads = function(req, res) {
    var limit = req.param('limit') || 10;
    Download
        .find({
            user_name: req.session.account
        })
        .sort({ downloaded_date: -1 })
        .skip(0)
        .limit(limit)
        .populate({
            path: 'file',
            select: 'name size num_downloads uploaded_date'
        })
        .populate({
            path: 'package',
            select: 'year free description name slug demo_url type'
        })
        .exec(function(err, downloads) {
            res.json(downloads);
        });
};

/**
 * Show recent packages
 */
exports.recentPackages = function(req, res) {
    var limit = req.param('limit') || 10;
    Package
        .find()
        .sort({ created_date: -1 })
        .skip(0)
        .limit(limit)
        .select('name type free slug demo_url created_date')
        .exec(function(err, packages) {
            res.json(packages);
        });
};

/**
 * Show most downloaded packages
 * TODO: Cache the most downloaded packages
 */
exports.mostDownloadedPackages = function(req, res) {
    var limit = parseInt(req.param('limit') || 10);
    Download.aggregate({
        $match: {
            package: {
                $ne: null
            }
        }
    }, {
        $group: {
            _id: '$package',
            num_downloads: { $sum: 1 }
        }
    }, {
        $sort: { num_downloads: -1 }
    }, {
        $limit: limit
    }, function(err, result) {
        if (err || result.length == 0) {
            return res.json([]);
        }
        var packageIds = [], map = {};
        for (var i in result) {
            packageIds.push(result[i]._id);
            map[result[i]._id] = result[i].num_downloads;
        }

        Package.find({
            _id: {
                $in: packageIds
            }
        }).select('name type free slug demo_url created_date').exec(function(err, packages) {
            if (err || !packages || packages.length == 0) {
                return res.json([]);
            }

            var result = [];
            for (var i in packages) {
                result.push({
                    name: packages[i].name,
                    type: packages[i].type,
                    free: packages[i].free,
                    slug: packages[i].slug,
                    demo_url: packages[i].demo_url,
                    created_date: packages[i].created_date,
                    num_downloads: map[packages[i]._id]
                });
            }
            result.sort(function(a, b) {
                return b.num_downloads - a.num_downloads;
            });

            res.json(result);
        });
    });
};

/**
 * List packages
 */
exports.package = function(req, res) {
    var app    = req.app,
        config = app.get('config'),

        // Criteria
        perPage        = 9,
        pageRange      = 5,
        page           = req.param('page') || 1,
        q              = req.param('q') || '',
        type           = req.param('type'),
        year           = req.param('year'),
        isDownloadable = req.param('downloadable'),
        criteria       = q ? { name: new RegExp(q, 'i') } : {};

    if (type) {
        criteria.type = type;
    }
    if (year) {
        criteria.year = year;
    }
    // Get account subscriptions
    var membershipIds = [];
    if (req.session.subscriptions) {
        var subscriptions = req.session.subscriptions;
        for (var i in subscriptions) {
            if (!moment(subscriptions[i].expiration, 'YYYY-MM-DD').isBefore()) {
                membershipIds.push(subscriptions[i]._id);
            }
        }
        switch (isDownloadable) {
            case 'true':
                if (membershipIds.length) {
                    criteria['$or'] = [
                        {
                            memberships: {
                                '$in': membershipIds
                            }
                        },
                        {
                            free: true
                        }
                    ];
                } else {
                    criteria.free = true;
                }
                break;

            case 'false':
                if (membershipIds.length) {
                    criteria.memberships = {
                        '$nin': membershipIds
                    };
                }
                criteria.free = false;
                break;

            case null:
            default:
                break;
        }
    }

    Package.count(criteria, function(err, total) {
        Package.find(criteria).skip((page - 1) * perPage).limit(perPage).sort({ 'year': -1, 'created_date': -1 }).populate('files').exec(function(err, packages) {
            if (err) {
                packages = [];
            }

            var numPages   = Math.ceil(total / perPage),
                startRange = (page == 1) ? 1 : pageRange * Math.floor(page / pageRange) + 1,
                endRange   = startRange + pageRange;

            if (endRange > numPages) {
                endRange = numPages;
            }

            res.render('account/package', {
                req: req,
                moment: moment,
                title: 'Packages',
                total: total,
                packages: packages,
                thumbPrefixUrl: config.thumbs.url,
                purchaseUrl: config.provider.registerUrl,
                downloadUrl: config.url.download || req.protocol + '://' + req.get('host'),
                membershipIds: membershipIds,

                // Criteria
                q: q,
                criteria: criteria,
                isDownloadable: isDownloadable,

                // Pagination
                page: page,
                numPages: numPages,
                startRange: startRange,
                endRange: endRange,

                // Helper
                filesize: filesize
            });
        });
    });
};

/**
 * View package details
 */
exports.view = function(req, res) {
    var app           = req.app,
        config        = app.get('config'),
        slug          = req.param('slug'),
        downloadable  = require('../helpers/downloadable'),
        membershipIds = [];

    // Get account subscriptions
    if (req.session.subscriptions) {
        var subscriptions = req.session.subscriptions;
        for (var i in subscriptions) {
            if (!moment(subscriptions[i].expiration, 'YYYY-MM-DD').isBefore()) {
                membershipIds.push(subscriptions[i]._id);
            }
        }
    }

    Package.findOne({ slug: slug }).populate('files').exec(function(err, package) {
        if (err || !package) {
            return res.send('Package not found', 404);
        }

        res.render('account/view', {
            title: package.name,
            package: package,
            downloadUrl: config.url.download || req.protocol + '://' + req.get('host'),
            frontEndUrl: config.url.frontEnd || req.protocol + '://' + req.get('host'),
            purchaseUrl: config.provider.registerUrl,
            thumbPrefixUrl: config.thumbs.url,
            isDownloadable: downloadable(package, membershipIds),

            filesize: filesize,
            moment: moment
        });
    });
};

/**
 * Download file
 */
exports.download = function(req, res) {
    var slug = req.param('slug'),
        id   = req.param('id');
    Package.findOne({ slug: slug }).populate('files').exec(function(err, package) {
        if (err || !package || package.files.length == 0) {
            return res.send('Not found', 404);
        }

        var file = null;
        for (var i in package.files) {
            if (package.files[i]._id == id) {
                file = package.files[i];
                break;
            }
        }
        if (!file) {
            return res.end('Not found', 404);
        }

        // Check if it's possible for account to download the file
        var downloadable = false;
        if (package.free) {
            downloadable = true;
        } else if (req.session.subscriptions) {
            var subscriptions = req.session.subscriptions;
            for (var i in subscriptions) {
                if (!moment(subscriptions[i].expiration, 'YYYY-MM-DD').isBefore() && package.memberships && package.memberships.indexOf(subscriptions[i]._id) != -1) {
                    downloadable = true;
                    break;
                }
            }
        }
        if (!downloadable) {
            return res.send('You is not allowed to download the file', 403);
        }

        file.num_downloads++;
        file.last_download = new Date();
        file.save(function(err) {
            if (!err) {
                res.setHeader('Content-Description', 'Download file');
                res.setHeader('Content-Type', 'application/octet-stream');
                res.setHeader('Content-Disposition', 'attachment; filename=' + file.name);

                fs
                    .createReadStream(file.path)
                    .on('end', function() {
                        new Download({
                            package: package._id,
                            file: id,
                            user_name: req.session.account,
                            ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
                            browser: req.headers['user-agent']
                        }).save();
                    })
                    .pipe(res);
            }
        });
    });
};
