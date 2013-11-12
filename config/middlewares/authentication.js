exports.requireAuthentication = function(req, res, next) {
    if (!req.session || !req.session.user) {
        req.session.returnTo = req.originalUrl;
        return res.redirect('/admin/signin');
    }
    // Set the variable for layout
    req.app.locals({
        sessionUser: req.session.user,
        provider: req.app.get('config').provider
    });
    next();
};

exports.requireAccountAuthentication = function(req, res, next) {
    if (!req.session || !req.session.account) {
        req.session.returnTo = req.originalUrl;
        return res.redirect('/account/signin');
    }
    // Set the variable for layout
    req.app.locals({
        account: req.session.account,
        provider: req.app.get('config').provider
    });
    next();
};

exports.user = {
    hasAuthorization: function (req, res, next) {
        // Only allow root to manage administrators
        if (!req.session || !req.session.user || 'root' != req.session.user.role) {
            req.flash('error', 'You are not allowed to access this page');
            return res.redirect('/admin');
        }
        next();
    }
};