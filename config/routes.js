var auth      = require('../app/controllers/auth'),
    dashboard = require('../app/controllers/dashboard'),
    index     = require('../app/controllers/index'),
    template  = require('../app/controllers/template');

var authentication = require('./middlewares/authentication');

module.exports = function(app) {
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
    app.all('/admin/template/edit/:id', authentication.requireAuthentication, template.edit);

    // Upload
    app.post('/admin/thumb', authentication.requireAuthentication, template.thumb);
    app.post('/admin/upload', authentication.requireAuthentication, template.upload);
};