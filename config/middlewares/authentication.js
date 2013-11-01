exports.requireAuthentication = function(req, res, next) {
    if (!req.session || !req.session.user_name) {
        req.session.returnTo = req.originalUrl;
        return res.redirect('/signin');
    }
    next();
};