/**
 * Templates/Extensions manager. Powered by MEAN stack
 *
 * @link    http://github.com/nghuuphuoc/templatemanager
 * @author  http://twitter.com/nghuuphuoc
 */

var moment   = require('moment'),
    mongoose = require('mongoose'),
    Package  = mongoose.model('package');

exports.index = function(req, res) {
    var app    = req.app,
        config = app.get('config');

    // TODO: Cache the tags
    Package.collection.distinct('tags', function(err, tags) {
        Package.collection.distinct('year', function(err, years) {
            res.render('index/index', {
                req: req,
                title: 'Packages',
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

exports.demo = function(req, res) {
    var slug = req.param('slug');
    if (!slug) {
        res.json({
            template: null
        });
    } else {
        Package.findOne({ type: 'template', slug: slug }).select('name slug themes demo_url description tags thumbs responsive free browsers software_versions high_resolution year').exec(function(err, template) {
            res.json({
                template: template
            });
        });
    }
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
        criteria       = {
            type: 'template',
            publish: true
        };

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

    Package.count(criteria, function(err, total) {
        Package
            .find(criteria, { '_id': 0 })
            .sort({ 'year': -1, 'created_date': -1 })
            .skip((page - 1) * perPage)
            .limit(perPage)
            .populate('files')
            .exec(function(err, packages) {
                var templates = [];
                for (var i in packages) {
                    templates.push({
                        name:              packages[i].name,
                        slug:              packages[i].slug,
                        themes:            packages[i].themes,
                        demo_url:          packages[i].demo_url,
                        thumbs:            packages[i].thumbs,
                        updated_date:      packages[i].updated_date ? moment(packages[i].updated_date).format('YYYY/MM/DD') : moment(packages[i].created_date).format('YYYY/MM/DD'),
                        software_versions: packages[i].software_versions ? packages[i].software_versions.split(',') : [],
                        year:              packages[i].year,
                        num_downloads:     packages[i].num_downloads
                    });
                }

                var numPages   = Math.ceil(total / perPage),
                    startRange = (page == 1) ? 1 : pageRange * Math.floor((page - 1) / pageRange) + 1,
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