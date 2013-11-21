var
    // For authentication
    http = require('http'),
    url  = require('url'),
    qs   = require('querystring'),

    mongoose   = require('mongoose'),
    Template   = mongoose.model('template'),
    Download   = mongoose.model('download'),
    Membership = mongoose.model('membership'),
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
                                return res.redirect('/account');
                            });
                        } else {
                            req.session.subscriptions = [];
                            return res.redirect('/account');
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
            registerUrl: config.provider.registerUrl
        });
    }
};

/**
 * Sign out
 */
exports.signout = function(req, res) {
    if (req.session.account) {
        delete req.session.account;
        res.redirect('/account/signin');
    } else {
        res.redirect('/');
    }
};

/**
 * Dashboard
 */
exports.dashboard = function(req, res) {
    res.render('account/dashboard', {
        title: 'Dashboard',
        subscriptions: req.session.subscriptions,
        moment: moment
    });
};

/**
 * List templates
 */
exports.template = function(req, res) {
    var app       = req.app,
        config    = app.get('config'),

        // Criteria
        perPage   = 9,
        pageRange = 5,
        page      = req.param('page') || 1,
        q         = req.param('q') || '',
        year      = req.param('year'),
        criteria  = q ? { name: new RegExp(q, 'i') } : {};

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
//        if (membershipIds.length) {
//            criteria.memberships = {
//                '$in': membershipIds
//            };
//        }
    }

    Template.count(criteria, function(err, total) {
        Template.find(criteria).skip((page - 1) * perPage).limit(perPage).sort({ created_date: -1 }).populate('files').exec(function(err, templates) {
            if (err) {
                templates = [];
            }

            var numPages   = Math.ceil(total / perPage),
                startRange = (page == 1) ? 1 : pageRange * Math.floor(page / pageRange) + 1,
                endRange   = startRange + pageRange;

            if (endRange > numPages) {
                endRange = numPages;
            }

            res.render('account/template', {
                req: req,
                moment: moment,
                title: 'Templates',
                total: total,
                templates: templates,
                thumbPrefixUrl: config.thumbs.url,
                purchaseUrl: config.provider.registerUrl,
                membershipIds: membershipIds,

                // Criteria
                q: q,
                year: year,

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
 * Download template
 */
exports.download = function(req, res) {
    var slug = req.param('slug'),
        id   = req.param('id');
    Template.findOne({
        slug: slug,
        files: id
    }).populate('files').exec(function(err, template) {
        if (err || !template || template.files.length == 0) {
            return res.send('Not found', 404);
        }

        var file = null;
        for (var i in template.files) {
            if (template.files[i]._id == id) {
                file = template.files[i];
                break;
            }
        }
        if (!file) {
            return res.end('Not found', 404);
        }

        // Check if it's possible for account to download the file
        var downloadable = false;
        if (template.free) {
            downloadable = true;
        } else if (req.session.subscriptions) {
            var subscriptions = req.session.subscriptions;
            for (var i in subscriptions) {
                if (!moment(subscriptions[i].expiration, 'YYYY-MM-DD').isBefore() && template.memberships && template.memberships.indexOf(subscriptions[i]._id) != -1) {
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
                var download = new Download({
                    template: template._id,
                    file: id,
                    user_name: req.session.account,
                    ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
                    browser: req.headers['user-agent']
                });
                download.save();

                res.setHeader('Content-Description', 'Download file');
                res.setHeader('Content-Type', 'application/octet-stream');
                res.setHeader('Content-Disposition', 'attachment; filename=' + file.name);

                var stream = fs.createReadStream(file.path);
                stream.pipe(res);
            }
        });
    });
};
