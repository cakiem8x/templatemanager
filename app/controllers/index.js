var mongoose    = require('mongoose'),
    Template    = mongoose.model('template');

exports.index = function(req, res) {
    var app    = req.app,
        config = app.get('config');

    var perPage   = 6,
        pageRange = 5,
        page      = req.param('page') || 1,
        q         = req.param('q') || '',
        year      = req.param('year'),
        criteria  = q ? { name: new RegExp(q, 'i') } : {};

    if (year) {
        criteria.year = year;
    }

    Template.count(criteria, function(err, total) {
        Template.find(criteria).skip((page - 1) * perPage).limit(perPage).exec(function(err, templates) {
            if (err) {
                templates = [];
            }

            var numPages   = Math.ceil(total / perPage),
                startRange = (page == 1) ? 1 : pageRange * Math.floor(page / pageRange) + 1,
                endRange   = startRange + pageRange;

            if (endRange > numPages) {
                endRange = numPages;
            }

            res.render('index/index', {
                req: req,
                title: 'Templates',
                total: total,
                templates: templates,
                thumbPrefixUrl: config.thumbs.url,

                // Criteria
                q: q,
                year: year,

                // Pagination
                page: page,
                numPages: numPages,
                startRange: startRange,
                endRange: endRange,

                // Provider
                provider: config.provider
            });
        });
    });
};