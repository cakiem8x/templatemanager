/**
 * Templates/Extensions manager. Powered by MEAN stack
 *
 * @link    http://github.com/nghuuphuoc/templatemanager
 * @author  http://twitter.com/nghuuphuoc
 */

var accountCtrl    = require('../app/controllers/account'),
    authCtrl       = require('../app/controllers/auth'),
    dashboardCtrl  = require('../app/controllers/dashboard'),
    fileCtrl       = require('../app/controllers/file'),
    guestCtrl      = require('../app/controllers/guest'),
    indexCtrl      = require('../app/controllers/index'),
    logCtrl        = require('../app/controllers/log'),
    membershipCtrl = require('../app/controllers/membership'),
    menuCtrl       = require('../app/controllers/menu'),
    packageCtrl    = require('../app/controllers/package'),
    userCtrl       = require('../app/controllers/user');

var authentication     = require('./middlewares/authentication'),
    menu               = require('./middlewares/menu'),
    adminAuthorization = [authentication.requireAuthentication, authentication.user.hasAuthorization],
    accountMiddleware  = [authentication.requireAccountAuthentication, menu.account];

module.exports = function(app) {
    // --- Front-end routes ---
    app.get('/',        indexCtrl.index);
    app.post('/demo',   indexCtrl.demo);
    app.post('/filter', indexCtrl.filter);

    // --- Administration routes ---

    // Auth
    app.all('/admin/password', authentication.requireAuthentication, authCtrl.changePassword);
    app.all('/admin/signin',   authCtrl.signin);
    app.get('/admin/signout',  authCtrl.signout);

    // Back-end
    app.get('/admin',                     authentication.requireAuthentication, dashboardCtrl.index);
    app.post('/admin/dashboard/account',  authentication.requireAuthentication, dashboardCtrl.account);
    app.post('/admin/dashboard/download', authentication.requireAuthentication, dashboardCtrl.download);
    app.post('/admin/dashboard/file',     authentication.requireAuthentication, dashboardCtrl.file);

    app.get('/admin/package',          authentication.requireAuthentication, packageCtrl.index);
    app.all('/admin/package/add',      authentication.requireAuthentication, packageCtrl.add);
    app.all('/admin/package/edit/:id', authentication.requireAuthentication, packageCtrl.edit);
    app.post('/admin/package/slug',    authentication.requireAuthentication, packageCtrl.slug);
    app.get('/admin/package/tag',      authentication.requireAuthentication, packageCtrl.tag);

    // Upload
    app.post('/admin/thumb', authentication.requireAuthentication, packageCtrl.thumb);

    // User
    app.get('/admin/user',               adminAuthorization, userCtrl.index);
    app.all('/admin/user/add',           adminAuthorization, userCtrl.add);
    app.post('/admin/user/check/:field', adminAuthorization, userCtrl.check);
    app.all('/admin/user/edit/:id',      adminAuthorization, userCtrl.edit);
    app.post('/admin/user/lock',         adminAuthorization, userCtrl.lock);

    // Membership
    app.get('/admin/membership',          adminAuthorization, membershipCtrl.index);
    app.post('/admin/membership/account', adminAuthorization, membershipCtrl.account);
    app.post('/admin/membership/add',     adminAuthorization, membershipCtrl.add);
    app.post('/admin/membership/edit',    adminAuthorization, membershipCtrl.edit);
    app.post('/admin/membership/remove',  adminAuthorization, membershipCtrl.remove);

    // File
    app.get('/admin/file',          authentication.requireAuthentication, fileCtrl.index);
    app.post('/admin/file/desc',    authentication.requireAuthentication, fileCtrl.desc);
    app.post('/admin/file/free',    authentication.requireAuthentication, fileCtrl.free);
    app.post('/admin/file/package', authentication.requireAuthentication, fileCtrl.package);
    app.post('/admin/file/remove',  authentication.requireAuthentication, fileCtrl.remove);
    app.post('/admin/file/search',  authentication.requireAuthentication, fileCtrl.search);
    app.post('/admin/file/upload',  authentication.requireAuthentication, fileCtrl.upload);

    // Download
    app.get('/admin/log/download', adminAuthorization, logCtrl.download);

    // Menu
    app.all('/admin/menu', adminAuthorization, menuCtrl.index);

    // --- Account routes ---
    app.all('/account/signin',  accountCtrl.signin);
    app.all('/account/signout', accountCtrl.signout);

    app.all('/account',                               accountMiddleware, accountCtrl.dashboard);
    app.post('/account/dashboard/download',           accountMiddleware, accountCtrl.recentDownloads);
    app.post('/account/dashboard/package/downloaded', accountMiddleware, accountCtrl.mostDownloadedPackages);
    app.post('/account/dashboard/package/latest',     accountMiddleware, accountCtrl.recentPackages);

    app.get('/account/download/:slug/:id', accountMiddleware, accountCtrl.download);
    app.all('/account/package',            accountMiddleware, accountCtrl.package);
    app.all('/account/package/:slug',      accountMiddleware, accountCtrl.view);

    // --- Guest routes ---
    app.get('/download/:id/:name', guestCtrl.download);
};