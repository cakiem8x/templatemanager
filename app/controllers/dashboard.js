/**
 * Templates/Extensions manager. Powered by MEAN stack
 *
 * @link    http://github.com/nghuuphuoc/templatemanager
 * @author  http://twitter.com/nghuuphuoc
 */

var mongoose = require('mongoose'),
    Download = mongoose.model('download'),
    File     = mongoose.model('file'),
    moment   = require('moment');

exports.index = function(req, res) {
    var config = req.app.get('config');
    res.render('dashboard/index', {
        title: 'Dashboard',
        frontEndUrl: config.url.frontEnd || req.protocol + '://' + req.get('host')
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
            path: 'file',
            select: 'name size num_downloads uploaded_date'
        })
        .populate({
            path: 'package',
            select: 'year free description name slug demo_url type'
        })
        .exec(function(err, downloads) {
            res.json(downloads);
        });
};

/**
 * Show top download accounts
 */
exports.account = function(req, res) {
    var days  = req.param('days') || 1,
        limit = parseInt(req.param('limit') || 10),
        date  = moment().subtract('days', days);

    Download.aggregate({
        $match: {
            downloaded_date: {
                '$gte': new Date(date.toISOString())
            }
        }
    }, {
        $group: {
            _id: '$user_name',
            num_downloads: { $sum: 1 }
        }
    }, {
        $sort: { num_downloads: -1 }
    }, {
        $limit: limit
    }, function(err, result) {
        res.json(result);
    });

    /*Download
        .aggregate()
        .match({
            downloaded_date: {
                '$gte': date.toISOString()
            }
        })
        .group({
            _id: '$user_name',
            num_downloads: { $sum: 1 }
        })
        .sort({ num_downloads: -1 })
        .limit(limit)
        .exec(function(err, result) {
            res.json(result.result);
        });*/
};

/**
 * Show top download files
 */
exports.file = function(req, res) {
    var days  = req.param('days') || 1,
        limit = req.param('limit') || 10,
        date  = moment().subtract('days', days);
    File
        .find({
            last_download: {
                '$gte': date.toISOString()
            }
        })
        .sort({ num_downloads: -1 })
        .skip(0)
        .limit(limit)
        .select('name description num_downloads uploaded_date')
        .exec(function(err, files) {
            res.json(files);
        });
};