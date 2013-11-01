var auth      = require('../app/controllers/auth'),
    dashboard = require('../app/controllers/dashboard'),
    index     = require('../app/controllers/index'),
    template  = require('../app/controllers/template');

var express        = require('express'),
    authentication = require('./middlewares/authentication');

module.exports = function(app, config) {
    // Routes
    app.get('/', index.index);

    // Sign in
    app.all('/signin', auth.signin);

    // Sign out
    app.get('/signout', auth.signout);

    // Back-end
    app.get('/admin', authentication.requireAuthentication, dashboard.index);
    app.get('/admin/template', authentication.requireAuthentication, template.index);
    app.all('/admin/template/add', authentication.requireAuthentication, template.add);

    // Upload
    // TODO: Set the max size for upload route only
    // Currently, I use
    // app.use(express.limit(config.upload.maxSize / 1024 + 'mb'));
    // But it applies for all routes
//    app.use('/admin/upload', express.bodyParser({
//        limit: config.upload.maxSize / 1024 + 'mb'
//    }));

    app.post('/admin/upload', authentication.requireAuthentication, template.upload);
};