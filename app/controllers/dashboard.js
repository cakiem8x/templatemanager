var mongoose = require('mongoose'),
    Download = mongoose.model('download'),
    File     = mongoose.model('file'),
    moment   = require('moment');

exports.index = function(req, res) {
    res.render('dashboard/index', {
        title: 'Dashboard',
        demoUrl: req.protocol + '://' + req.get('host')
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
            path: 'template',
            select: 'year free description name slug demo_url'
        })
        .exec(function(err, downloads) {
            res.json(downloads);
        });
};

/**
 * Download statistics
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