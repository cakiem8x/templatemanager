var mongoose = require('mongoose'),
    User     = mongoose.model('user');

/**
 * Sign in
 */
exports.signin = function(req, res) {
    if ('post' == req.method.toLowerCase()) {
        User.findOne({ username: req.body.user_name }, function(err, user) {
            if (err || !user) {
                req.flash('error', 'Not found administrator account');
                return res.redirect('/admin/signin');
            }
            if (!user.verifyPassword(req.body.password)) {
                req.flash('error', 'Wrong password');
                return res.redirect('/admin/signin');
            }

            req.session.user = {
                username: user.username,
                role: user.role
            };
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

/**
 * Sign out
 */
exports.signout = function(req, res) {
    if (req.session.user) {
        delete req.session.user;
        res.redirect('/admin/signin');
    } else {
        res.redirect('/');
    }
};

/**
 * Change the password
 */
exports.changePassword = function(req, res) {
    if ('post' == req.method.toLowerCase()) {
        var userName    = req.session.user.username,
            password    = req.body.password,
            newPassword = req.body.new_password,
            confirm     = req.body.confirm_password;

        if (!password || !newPassword || !confirm) {
            req.flash('error', 'The current and new passwords are required');
            return res.redirect('/admin/password');
        }
        if (newPassword != confirm) {
            req.flash('error', 'The new password and confirmation one have to be the same');
            return res.redirect('/admin/password');
        }

        User.findOne({ username: userName }, function(err, user) {
            if (err || !user) {
                req.flash('error', 'Not found administrator account');
                return res.redirect('/admin/password');
            }

            // Verify current password
            if (!user.verifyPassword(password)) {
                req.flash('error', 'The current password is wrong');
                return res.redirect('/admin/password');
            }

            // Update the password
            user.password = newPassword;
            user.save(function(err) {
                if (err) {
                    req.flash('error', 'Could not update the password');
                } else {
                    req.flash('success', 'The password is updated successfully');
                }
                return res.redirect('/admin/password');
            });
        });
    } else {
        res.render('auth/changePassword', {
            messages: {
                warning: req.flash('error'),
                success: req.flash('success')
            },
            title: 'Change the password'
        });
    }
};