var express    = require('express'),
    mongoStore = require('connect-mongo')(express);

module.exports = function(app, config) {
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
        app.use(express.bodyParser());

        app.use(express.methodOverride());

        app.use(express.session({
            secret: config.sessionSecret,
            store: new mongoStore({
                url: config.db,
                collection : 'sessions'
            })
        }));

        app.use(app.router);
    });

    app.configure('development', function() {
//        app.use(express.errorHandler({
//            dumpExceptions: true,
//            howStack: true
//        }));
    });
};