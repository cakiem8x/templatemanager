var account    = require('../app/controllers/account'),
    auth       = require('../app/controllers/auth'),
    dashboard  = require('../app/controllers/dashboard'),
    file       = require('../app/controllers/file'),
    index      = require('../app/controllers/index'),
    membership = require('../app/controllers/membership'),
    package    = require('../app/controllers/package'),
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
    app.post('/admin/dashboard/file', authentication.requireAuthentication, dashboard.file);
    app.post('/admin/dashboard/account', authentication.requireAuthentication, dashboard.account);

    app.all('/admin/password', authentication.requireAuthentication, auth.changePassword);

    app.get('/admin/package', authentication.requireAuthentication, package.index);
    app.all('/admin/package/add', authentication.requireAuthentication, package.add);
    app.all('/admin/package/edit/:id', authentication.requireAuthentication, package.edit);
    app.post('/admin/package/slug', authentication.requireAuthentication, package.slug);

    // Upload
    app.post('/admin/thumb', authentication.requireAuthentication, package.thumb);

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
    app.get('/admin/file', authentication.requireAuthentication, file.index);
    app.post('/admin/file/upload', authentication.requireAuthentication, file.upload);
    app.post('/admin/file/desc', authentication.requireAuthentication, file.desc);
    app.post('/admin/file/search', authentication.requireAuthentication, file.search);

    // --- Account routes ---
    app.all('/account/signin', account.signin);
    app.all('/account/signout', account.signout);

    app.all('/account', authentication.requireAccountAuthentication, account.dashboard);
    app.post('/account/dashboard/download', authentication.requireAccountAuthentication, account.recentDownloads);

    app.all('/account/package', authentication.requireAccountAuthentication, account.package);
    app.get('/account/download/:slug/:id', authentication.requireAccountAuthentication, account.download);
};