/**
 * Templates/Extensions manager. Powered by MEAN stack
 *
 * @link    http://github.com/nghuuphuoc/templatemanager
 * @author  http://twitter.com/nghuuphuoc
 */

var express    = require('express'),
    flash      = require('connect-flash'),
    mongoStore = require('connect-mongo')(express);

module.exports = function(app, config) {
    app.set('config', config);
    app.set('showStackError', true);

    // Should be placed before express.static
    app.use(express.compress({
        filter: function(req, res) {
            return /json|text|javascript|css/.test(res.getHeader('Content-Type'))
        },
        level: 9
    }));

    app.use(express.static(config.root + '/public'));

    // Don't use logger for test env
    if (process.env.NODE_ENV !== 'test') {
        app.use(express.logger('dev'));
    }

    // Set the views path, template engine, and default layout
    app.set('views', config.root + '/app/views');
    app.set('view engine', 'jade');

    app.configure(function() {
        // cookieParser should be above session
        app.use(express.cookieParser());

        app.use(express.limit(config.upload.maxSize / 1024 + 'mb'));

        // bodyParser should be above methodOverride
        // Disable bodyParser() for file upload
        app.use(express.json())
           .use(express.urlencoded());

        app.use(express.methodOverride());

        app.use(express.session({
            secret: config.session.secret,
            cookie: {
                domain: config.session.domain,
                maxAge: new Date(Date.now() + config.session.lifetime)
                // maxAge: config.session.lifetime
            },
            store: new mongoStore({
                url: config.db,
                collection : 'session'
            })
        }));

        // Connect flash for flash messages
        // Should be declared after sessions
        app.use(flash());

        app.use(app.router);
    });

    app.configure('development', function() {
        app.use(express.errorHandler({
            dumpExceptions: true,
            howStack: true
        }));
    });
};