/**
 * Templates/Extensions manager. Powered by MEAN stack
 *
 * @link    http://github.com/nghuuphuoc/templatemanager
 * @author  http://twitter.com/nghuuphuoc
 */

var mongoose = require('mongoose'),
    Download = mongoose.model('download'),
    moment   = require('moment'),
    filesize = require('filesize');

/**
 * Show download history
 */
exports.download = function(req, res) {
    var perPage   = 20,
        pageRange = 5,
        page      = req.param('page') || 1,
        sortBy    = req.param('sort') || '-downloaded_date',
        days      = req.param('days'),
        account   = req.param('account'),
        guest     = req.param('guest'),
        criteria  = {};

    if (days) {
        var date = moment().subtract('days', days);
        criteria.downloaded_date = {
            '$gte': new Date(date.toISOString())
        };
    }
    if (account) {
        criteria.user_name = account;
    }
    if (guest || guest == 'true') {
        criteria.user_name = '@guest';
    }

    var sortCriteria = {}, sortDirection = ('-' == sortBy.substr(0, 1)) ? -1 : 1;
    sortBy = '-' == sortBy.substr(0, 1) ? sortBy.substr(1) : sortBy;
    sortCriteria[sortBy] = sortDirection;


    Download.count(criteria, function(err, total) {
        Download
            .find(criteria)
            .sort(sortCriteria)
            .skip((page - 1) * perPage)
            .limit(perPage)
            .populate({
                path: 'file',
                select: 'name size'
            })
            .populate({
                path: 'package',
                select: 'name type demo_url free'
            })
            .exec(function(err, downloads) {
            if (err) {
                downloads = [];
            }

            var numPages   = Math.ceil(total / perPage),
                startRange = (page == 1) ? 1 : pageRange * Math.floor((page - 1) / pageRange) + 1,
                endRange   = startRange + pageRange;

            if (endRange > numPages) {
                endRange = numPages;
            }

            res.render('log/download', {
                title: 'Download history',

                req: req,
                total: total,
                downloads: downloads,

                // Helper
                filesize: filesize,
                moment: moment,

                // Criteria
                account: account,
                days: days,
                guest: guest,
                sortBy: sortBy,
                sortDirection: sortDirection,

                // Pagination
                page: page,
                numPages: numPages,
                startRange: startRange,
                endRange: endRange
            });
        });
    });
};