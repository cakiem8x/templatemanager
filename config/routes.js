var index = require('../app/controllers/index');

module.exports = function(app) {
    // Routes
    app.get('/', index.index);
};