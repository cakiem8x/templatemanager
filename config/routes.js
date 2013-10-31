var index = require('../app/controllers/index'),
    auth  = require('../app/controllers/auth');

module.exports = function(app) {
    // Routes
    app.get('/', index.index);

    // Sign in
    app.all('/signin', auth.signin);
};