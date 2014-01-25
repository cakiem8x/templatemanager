/**
 * Templates/Extensions manager. Powered by MEAN stack
 *
 * @link    http://github.com/nghuuphuoc/templatemanager
 * @author  http://twitter.com/nghuuphuoc
 */

var mongoose = require('mongoose'),
    Option   = mongoose.model('option');

exports.index = function(req, res) {
    if ('post' == req.method.toLowerCase()) {
        Option.findOne({ key: 'account_menu' }).exec(function(err, option) {
            if (option == null) {
                option = new Option({
                    key: 'account_menu'
                });
            }
            option.value = req.body.menu;
            option.save(function(err) {
                err ? req.flash('error', 'Could not save menu items')
                    : req.flash('success', 'The menu items have been updated successfully');
                return res.redirect('/admin/menu');
            });
        });
    } else {
        Option.findOne({ key: 'account_menu' }).exec(function(err, option) {
            res.render('menu/index', {
                title: 'Configure menu',
                menu: option ? option.value : '',
                messages: {
                    warning: req.flash('error'),
                    success: req.flash('success')
                }
            });
        });
    }
};