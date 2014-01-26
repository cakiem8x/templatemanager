/**
 * Templates/Extensions manager. Powered by MEAN stack
 *
 * @link    http://github.com/nghuuphuoc/templatemanager
 * @author  http://twitter.com/nghuuphuoc
 */

exports.requireAuthentication = function(req, res, next) {
    if (!req.session || !req.session.user) {
        if (!req.xhr) {
            req.session.returnTo = req.originalUrl;
        }
        return res.redirect('/admin/signin');
    }
    // Set the variable for layout
    var url    = req.protocol + '://' + req.get('host'),
        config = req.app.get('config');
    req.app.locals({
        sessionUser: req.session.user,
        provider: req.app.get('config').provider,
        frontEndUrl: config.url.frontEnd || url
    });
    next();
};

exports.requireAccountAuthentication = function(req, res, next) {
    if (!req.session || !req.session.account) {
        if (!req.xhr) {
            req.session.returnTo = req.originalUrl;
        }
        return res.redirect('/account/signin');
    }
    // Set the variable for layout
    var url    = req.protocol + '://' + req.get('host'),
        config = req.app.get('config');
    req.app.locals({
        account: req.session.account,
        provider: req.app.get('config').provider,
        frontEndUrl: config.url.frontEnd || url
    });
    next();
};

exports.user = {
    hasAuthorization: function(req, res, next) {
        // Only allow root to manage administrators
        if (!req.session || !req.session.user || 'root' != req.session.user.role) {
            req.flash('error', 'You are not allowed to access this page');
            return res.redirect('/admin');
        }
        next();
    }
};