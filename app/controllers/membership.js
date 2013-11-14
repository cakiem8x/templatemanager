var http = require('http'),
    url  = require('url'),
    qs   = require('querystring');

/**
 * List memberships
 */
exports.index = function(req, res) {
    var app         = req.app,
        config      = app.get('config'),
        apiEndpoint = url.parse(config.amember.url);

    var data = qs.stringify({
            _key: config.amember.key
        }),
        options = {
            host: apiEndpoint.host,
            port: apiEndpoint.port || 80,
            path: (apiEndpoint.path == '/' ? '' : apiEndpoint.path) + '/api/products?' + data,
            method: 'GET'
        };

    var request = http.request(options, function(response) {
        response.setEncoding('utf8');
        var body = '';
        response.on('data', function(chunk) {
            body += chunk;
        });
        response.on('end', function() {
            var result   = JSON.parse(body),
                products = [];      // Amember products
            delete result._total;
            for (var key in result) {
                key = key + '';
                products.push({
                    pid: result[key].product_id,
                    title: result[key].title,
                    description: result[key].description,
                    disabled: result[key].is_disabled == '1'
                });
            }

            res.render('membership/index', {
                title: 'Manage memberships',
                products: products
            });
        });
    });
    request.on('error', function(e) {
        req.flash('error', e.message);
        res.redirect('/admin');
    });
    request.end();
};

/**
 * Add new membership
 */
exports.add = function(req, res) {
    res.json({
        success: true
    });
};

/**
 * Update the membership
 */
exports.edit = function(req, res) {
    res.json({
        success: true
    });
};

/**
 * Remove the membership
 */
exports.remove = function(req, res) {
    res.json({
        success: true
    });
};