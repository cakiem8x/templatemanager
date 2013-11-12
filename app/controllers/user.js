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
        return res.redirect('/admin/user');
    } else {
        res.render('user/add', {
            title: 'Add new administrator'
        });
    }
};

/**
 * Check if an username/email address has been taken
 */
exports.check = function(req, res) {
    var field = req.param('field'),
        value = req.body[field],
        user  = new User();
    user[field] = value;
    User.isAvailable(user, field, function(isAvailable) {
        res.json({
            valid: isAvailable
        });
    });
};