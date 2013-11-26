/**
 * Templates/Extensions manager. Powered by MEAN stack
 *
 * @link    http://github.com/nghuuphuoc/templatemanager
 * @author  http://twitter.com/nghuuphuoc
 */

var http       = require('http'),
    url        = require('url'),
    qs         = require('querystring'),
    mongoose   = require('mongoose'),
    Membership = mongoose.model('membership');

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
                products = {};      // Amember products
            delete result._total;
            for (var key in result) {
                key = key + '';
                products[result[key].product_id] = {
                    pid: result[key].product_id,
                    title: result[key].title,
                    description: result[key].description,
                    disabled: result[key].is_disabled == '1'
                };
            }

            Membership.find().exec().then(function(result) {
                var memberships = {};
                for (var i in result) {
                    memberships[result[i].pid + ''] = result[i];
                }

                res.render('membership/index', {
                    title: 'Manage memberships',
                    products: products,
                    memberships: memberships
                });
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
    var membership = new Membership({
        pid: req.body.pid,
        title: req.body.title,
        description: req.body.description
    });
    membership.save(function(err) {
        res.json({
            success: !err,
            id: membership._id
        });
    });
};

/**
 * Update the membership
 */
exports.edit = function(req, res) {
    Membership.findOne({ _id: req.body.id }).exec().then(function(membership) {
        if (!membership) {
            return res.json({
                success: false
            });
        }
        membership.pid         = req.body.pid;
        membership.title       = req.body.title;
        membership.description = req.body.description;
        membership.save(function(err) {
            res.json({
                success: !err
            });
        });
    });
};

/**
 * Remove the membership
 */
exports.remove = function(req, res) {
    Membership.findOne({ _id: req.body.id }).exec().then(function(membership) {
        if (!membership) {
            return res.json({
                success: false
            });
        }
        membership.remove(function(err) {
            res.json({
                success: !err
            });
        });
    });

    res.json({
        success: true
    });
};