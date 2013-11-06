var http = require('http'),
    url  = require('url'),
    qs   = require('querystring');

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