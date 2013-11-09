var mongoose    = require('mongoose'),
    Template    = mongoose.model('template');

exports.index = function(req, res) {
    var app    = req.app,
        config = app.get('config');

    Template.collection.distinct('tags', function(err, tags) {
        Template.collection.distinct('year', function(err, years) {
            res.render('index/index', {
                req: req,
                title: 'Templates',
                templates: {},
                thumbPrefixUrl: config.thumbs.url,

                years: years,
                tags: tags,

                // Provider
                provider: config.provider
            });
        });
    });
};

exports.filter = function(req, res) {
    var app    = req.app,
        config = app.get('config');

    var perPage        = 6,
        pageRange      = 5,
        page           = req.param('page') || 1,
        year           = req.param('year'),
        tag            = req.param('tag'),
        responsive     = req.param('responsive'),
        highResolution = req.param('high_resolution'),
        criteria       = {};

    if (year) {
        criteria.year = year;
    }
    if (tag) {
        criteria.tags = tag;
    }
    if (responsive) {
        criteria.responsive = responsive;
    }
    if (highResolution) {
        criteria.high_resolution = highResolution;
    }

    Template.count(criteria, function(err, total) {
        Template.find(criteria, { '_id': 0 }).select('name themes demo_url description tags thumbs responsive free browsers software_versions high_resolution year').skip((page - 1) * perPage).limit(perPage).exec(function(err, templates) {
            if (err) {
                templates = [];
            }

            var numPages   = Math.ceil(total / perPage),
                startRange = (page == 1) ? 1 : pageRange * Math.floor(page / pageRange) + 1,
                endRange   = startRange + pageRange;

            if (endRange > numPages) {
                endRange = numPages;
            }

            res.json({
                total: total,
                templates: templates,
                thumbPrefixUrl: config.thumbs.url,

                // Pagination
                page: page,
                numPages: numPages,
                startRange: startRange,
                endRange: endRange
            });
        });
    });
};