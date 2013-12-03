/**
 * Templates/Extensions manager. Powered by MEAN stack
 *
 * @link    http://github.com/nghuuphuoc/templatemanager
 * @author  http://twitter.com/nghuuphuoc
 */

var account    = require('../app/controllers/account'),
    auth       = require('../app/controllers/auth'),
    dashboard  = require('../app/controllers/dashboard'),
    file       = require('../app/controllers/file'),
    guest      = require('../app/controllers/guest'),
    index      = require('../app/controllers/index'),
    log        = require('../app/controllers/log'),
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
    app.post('/admin/membership/account', adminAuthorization, membership.account);

    // File
    app.get('/admin/file', authentication.requireAuthentication, file.index);
    app.post('/admin/file/desc', authentication.requireAuthentication, file.desc);
    app.post('/admin/file/free', authentication.requireAuthentication, file.free);
    app.post('/admin/file/package', authentication.requireAuthentication, file.package);
    app.post('/admin/file/remove', authentication.requireAuthentication, file.remove);
    app.post('/admin/file/search', authentication.requireAuthentication, file.search);
    app.post('/admin/file/upload', authentication.requireAuthentication, file.upload);

    // Download
    app.get('/admin/log/download', adminAuthorization, log.download);

    // --- Account routes ---
    app.all('/account/signin', account.signin);
    app.all('/account/signout', account.signout);

    app.all('/account', authentication.requireAccountAuthentication, account.dashboard);
    app.post('/account/dashboard/download', authentication.requireAccountAuthentication, account.recentDownloads);
    app.post('/account/dashboard/package/latest', authentication.requireAccountAuthentication, account.recentPackages);
    app.post('/account/dashboard/package/downloaded', authentication.requireAccountAuthentication, account.mostDownloadedPackages);

    app.all('/account/package', authentication.requireAccountAuthentication, account.package);
    app.all('/account/package/:slug', authentication.requireAccountAuthentication, account.view);
    app.get('/account/download/:slug/:id', authentication.requireAccountAuthentication, account.download);

    // --- Guest routes ---
    app.get('/download/:id/:name', guest.download);
};