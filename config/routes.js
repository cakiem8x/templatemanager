var auth      = require('../app/controllers/auth'),
    dashboard = require('../app/controllers/dashboard'),
    index     = require('../app/controllers/index');

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
};