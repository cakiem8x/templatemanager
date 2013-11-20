var account    = require('../app/controllers/account'),
    auth       = require('../app/controllers/auth'),
    dashboard  = require('../app/controllers/dashboard'),
    file       = require('../app/controllers/file'),
    index      = require('../app/controllers/index'),
    membership = require('../app/controllers/membership'),
    template   = require('../app/controllers/template'),
    user       = require('../app/controllers/user');

var authentication     = require('./middlewares/authentication'),
    adminAuthorization = [authentication.requireAuthentication, authentication.user.hasAuthorization];

module.exports = function(app) {
    // --- Front-end routes ---
    app.get('/', index.index);
    app.post('/filter', index.filter);
    app.post('/demo', index.demo);

    // --- Administration routes ---

    // Auth
    app.all('/admin/signin', auth.signin);
    app.get('/admin/signout', auth.signout);

    // Back-end
    app.get('/admin', authentication.requireAuthentication, dashboard.index);
    app.post('/admin/dashboard/download', authentication.requireAuthentication, dashboard.download);

    app.all('/admin/password', authentication.requireAuthentication, auth.changePassword);

    app.get('/admin/template', authentication.requireAuthentication, template.index);
    app.all('/admin/template/add', authentication.requireAuthentication, template.add);
    app.all('/admin/template/edit/:id', authentication.requireAuthentication, template.edit);
    app.post('/admin/template/slug', authentication.requireAuthentication, template.slug);

    // Upload
    app.post('/admin/thumb', authentication.requireAuthentication, template.thumb);

    // User
    app.get('/admin/user', adminAuthorization, user.index);
    app.all('/admin/user/add', adminAuthorization, user.add);
    app.all('/admin/user/edit/:id', adminAuthorization, user.edit);
    app.post('/admin/user/check/:field', adminAuthorization, user.check);
    app.post('/admin/user/lock', adminAuthorization, user.lock);

    // Membership
    app.get('/admin/membership', adminAuthorization, membership.index);
    app.post('/admin/membership/add', adminAuthorization, membership.add);
    app.post('/admin/membership/edit', adminAuthorization, membership.edit);
    app.post('/admin/membership/remove', adminAuthorization, membership.remove);

    // File
    app.post('/admin/file/upload', authentication.requireAuthentication, file.upload);
    app.post('/admin/file/desc', authentication.requireAuthentication, file.desc);

    // --- Account routes ---
    app.all('/account/signin', account.signin);
    app.all('/account/signout', account.signout);

    app.all('/account', authentication.requireAccountAuthentication, account.dashboard);
    app.all('/account/template', authentication.requireAccountAuthentication, account.template);
    app.get('/account/download/:slug/:id', authentication.requireAccountAuthentication, account.download);
};