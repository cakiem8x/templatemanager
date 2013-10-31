var auth      = require('../app/controllers/auth'),
    dashboard = require('../app/controllers/dashboard'),
    index     = require('../app/controllers/index');

module.exports = function(app) {
    // Routes
    app.get('/', index.index);

    // Sign in
    app.all('/signin', auth.signin);

    // Back-end
    app.get('/admin', dashboard.index);
};