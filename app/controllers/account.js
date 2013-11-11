var
    // For authentication
    http = require('http'),
    url  = require('url'),
    qs   = require('querystring'),

    mongoose = require('mongoose'),
    Template = mongoose.model('template'),
    Download = mongoose.model('download'),
    fs       = require('fs'),
    filesize = require('filesize');

/**
 * Sign in
 */
exports.signin = function(req, res) {
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
                path: '/api/check-access/by-login-pass?' + data
            };
        var result = {
            ok: false,
            error: null,
            message: null
        };
        var request = http.request(options, function(response) {
            response.setEncoding('utf8');
            response.on('data', function(chunk) {
                result = JSON.parse(chunk);

                if (result.ok == true || result.ok == 'true') {
                    req.session.account = req.body.user_name;
                    res.redirect('/account');
                } else {
                    req.flash('error', result.message || result.msg);
                    return res.redirect('/account/signin');
                }
            });
        });
        request.end();
    } else {
        res.render('account/signin', {
            messages: {
                warning: req.flash('error'),
                success: req.flash('success')
            },
            title: 'Sign in'
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
        title: 'Dashboard'
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

    Template.count(criteria, function(err, total) {
        Template.find(criteria).skip((page - 1) * perPage).limit(perPage).sort({ created_date: -1 }).exec(function(err, templates) {
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
    var id = req.param('id');
    Template.findOne({ 'files._id': id }).exec(function(err, template) {
        if (!err) {
            var file = null;
            // TODO: Find a quick and more convenient way to get the file
            for (var i in template.files) {
                if (template.files[i]._id == id) {
                    file = template.files[i];
                    break;
                }
            }
            if (!file) {
                return res.end('Not found');
            }

            file.num_downloads++;
            template.save(function(err) {
                if (!err) {
                    var download = new Download({
                        template: template._id,
                        file: id,
                        user_name: req.session.account
                    });
                    download.save();

                    res.setHeader('Content-Description', 'Download file');
                    res.setHeader('Content-Type', 'application/octet-stream');
                    res.setHeader('Content-Disposition', 'attachment; filename=' + file.name);

                    var stream = fs.createReadStream(file.path);
                    stream.pipe(res);
                }
            });
        }
    });
};
