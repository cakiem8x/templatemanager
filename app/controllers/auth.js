var mongoose = require('mongoose'),
    User     = mongoose.model('user');

exports.signin = function(req, res) {
    if (req.body.user_name) {
        User.findOne({ username: req.body.user_name }, function(err, user) {
            if (err) {
                // TODO: Add flash message
                res.redirect('/signin');
                return;
            }
            if (!user) {
                res.redirect('/signin');
                return;
            }
            if (!user.verifyPassword(req.body.password)) {
                res.redirect('/signin');
                return;
            }

            req.session.user_name = user.username;
            res.redirect('/admin');
        });
    } else {
        res.render('auth/signin', {
            title: 'Sign in'
        });
    }
};

exports.signout = function(req, res) {
    if (req.session.user_name) {
        delete req.session.user_name;
        res.redirect('/signin');
    } else {
        res.redirect('/');
    }
};