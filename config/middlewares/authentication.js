exports.requireAuthentication = function(req, res, next) {
    if (!req.session || !req.session.user_name) {
        req.session.returnTo = req.originalUrl;
        return res.redirect('/admin/signin');
    }
    // Set the variable for layout
    req.app.locals({
        user_name: req.session.user_name
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
        account: req.session.account
    });
    next();
};