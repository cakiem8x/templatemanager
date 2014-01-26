/**
 * Templates/Extensions manager. Powered by MEAN stack
 *
 * @link    http://github.com/nghuuphuoc/templatemanager
 * @author  http://twitter.com/nghuuphuoc
 */

var mongoose = require('mongoose'),
    Option   = mongoose.model('option'),
    marked   = require('marked');

exports.account = function(req, res, next) {
    Option.findOne({ key: 'account_menu' }).exec(function(err, option) {
        if (option) {
            req.app.locals.accountMenu = marked(option.value);
        }

        next();
    });
};