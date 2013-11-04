var mongoose = require('mongoose'),
    User     = mongoose.model('user');

exports.signin = function(req, res) {
    if ('post' == req.method.toLowerCase()) {
        User.findOne({ username: req.body.user_name }, function(err, user) {
            if (err || !user) {
                req.flash('error', 'Not found administrator account');
                return res.redirect('/signin');
            }
            if (!user.verifyPassword(req.body.password)) {
                req.flash('error', 'Wrong password');
                return res.redirect('/signin');
            }

            req.session.user_name = user.username;
            return res.redirect('/admin');
        });
    } else {
        res.render('auth/signin', {
            messages: {
                warning: req.flash('error'),
                success: req.flash('success')
            },
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