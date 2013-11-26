/**
 * Templates/Extensions manager. Powered by MEAN stack
 *
 * @link    http://github.com/nghuuphuoc/templatemanager
 * @author  http://twitter.com/nghuuphuoc
 */

var mongoose = require('mongoose'),
    User     = mongoose.model('user');

/**
 * List administrators
 */
exports.index = function(req, res) {
    var perPage   = 10,
        pageRange = 5,
        page      = req.param('page') || 1,
        q         = req.param('q') || '',
        criteria  = q ? { username: new RegExp(q, 'i') } : {};

    User.count(criteria, function(err, total) {
        User.find(criteria).skip((page - 1) * perPage).limit(perPage).exec(function(err, users) {
            if (err) {
                users = [];
            }

            var numPages   = Math.ceil(total / perPage),
                startRange = (page == 1) ? 1 : pageRange * Math.floor(page / pageRange) + 1,
                endRange   = startRange + pageRange;

            if (endRange > numPages) {
                endRange = numPages;
            }

            res.render('user/index', {
                req: req,
                title: 'Administrators',
                total: total,
                users: users,

                // Criteria
                q: q,
                currentUser: req.session.user.username,

                // Pagination
                page: page,
                numPages: numPages,
                startRange: startRange,
                endRange: endRange
            });
        });
    });
};

/**
 * Add new administrator
 */
exports.add = function(req, res) {
    if ('post' == req.method.toLowerCase()) {
        var user = new User({
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            username: req.body.username,
            email: req.body.email,
            password: req.body.password,
            role: req.body.role
        });
        var callback = function(success) {
            req.flash(success ? 'success' : 'error', success ? 'The administrator has been added successfully' : 'Cannot add new administrator');
            return res.redirect('/admin/user/add');
        };
        User.isAvailable(user, 'username', function(isUsernameAvailable) {
            if (isUsernameAvailable) {
                User.isAvailable(user, 'email', function(isEmailAvailable) {
                    if (isEmailAvailable) {
                        user.save(function(err) {
                            callback(!err);
                        });
                    } else {
                        callback(false);
                    }
                });
            } else {
                callback(false);
            }
        });
    } else {
        res.render('user/add', {
            messages: {
                warning: req.flash('error'),
                success: req.flash('success')
            },
            title: 'Add new administrator'
        });
    }
};

/**
 * Update an administrator account
 */
exports.edit = function(req, res) {
    var id = req.param('id');
    if ('post' == req.method.toLowerCase()) {
        User.findOne({ _id: id }, function(err, user) {
            var isCurrentUser = req.session.user.username == user.username;

            user.first_name = req.body.first_name;
            user.last_name  = req.body.last_name;
            user.username   = req.body.username;
            user.email      = req.body.email;
            user.role       = req.body.role;

            if (req.body.password && req.body.confirm_password && req.body.password == req.body.confirm_password) {
                user.password = req.body.password;
            }

            var callback = function(success) {
                req.flash(success ? 'success' : 'error', success ? 'The administrator has been updated successfully' : 'Cannot update the administrator');

                // Update the session
                if (success && isCurrentUser) {
                    req.session.user = {
                        username: user.username,
                        role: user.role
                    };
                }

                return res.redirect('/admin/user/edit/' + id);
            };
            User.isAvailable(user, 'username', function(isUsernameAvailable, foundUser) {
                if (isUsernameAvailable || (foundUser && foundUser._id == id)) {
                    User.isAvailable(user, 'email', function(isEmailAvailable, foundUser) {
                        if (isEmailAvailable || (foundUser && foundUser._id == id)) {
                            user.save(function(err) {
                                callback(!err);
                            });
                        } else {
                            callback(false);
                        }
                    });
                } else {
                    callback(false);
                }
            });
        });
    } else {
        User.findOne({ _id: id }, function(err, user) {
            res.render('user/edit', {
                messages: {
                    warning: req.flash('error'),
                    success: req.flash('success')
                },
                title: 'Edit the administrator',
                user: user
            });
        });
    }
};

/**
 * Lock/unlock administrator
 */
exports.lock = function(req, res) {
    var id = req.body.id;
    User.findOne({ _id: id }, function(err, user) {
        if (req.session.user.username == user.username) {
            return res.json({
                success: false
            });
        }

        user.locked = !user.locked;
        user.save(function(err) {
            return res.json({
                success: !err
            });
        });
    });
};

/**
 * Check if an username/email address has been taken
 */
exports.check = function(req, res) {
    var field = req.param('field'),
        id    = req.body.id,
        value = req.body[field],
        user  = new User();
    user[field] = value;
    User.isAvailable(user, field, function(isAvailable, foundUser) {
        res.json({
            valid: isAvailable || (id && foundUser && foundUser._id == id)
        });
    });
};