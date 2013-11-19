var mongoose = require('mongoose'),
    Download = mongoose.model('download');

exports.index = function(req, res) {
    res.render('dashboard/index', {
        title: 'Dashboard'
    });
};

/**
 * Show recent downloads
 */
exports.download = function(req, res) {
    var limit = req.param('limit') || 10;
    Download
        .find()
        .sort({ downloaded_date: -1 })
        .skip(0)
        .limit(limit)
        .populate({
            path: 'template',
            select: 'year free description name slug demo_url files'
        })
        .exec(function(err, downloads) {
            res.json(downloads);
        });
};