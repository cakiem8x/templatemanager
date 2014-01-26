/**
 * Templates/Extensions manager. Powered by MEAN stack
 *
 * @link    http://github.com/nghuuphuoc/templatemanager
 * @author  http://twitter.com/nghuuphuoc
 */

var mongoose       = require('mongoose'),
    Schema         = mongoose.Schema,
    packageSchema  = new Schema({
        type:     { type: String, default: 'template' },
        name:     { type: String, default: '' },
        slug:     { type: String, default: '' },
        demo_url: { type: String, default: '' },
        themes: [{
            name:     { type: String, default: '' },
            color:    { type: String, default: '' },
            demo_url: { type: String, default: '' }
        }],
        description: { type: String, default: '' },
        changelog:   { type: String, default: '' },
        tags: {
            type: [],
            get: function(tags) {
                return tags.join(',');
            },
            set: function(tags) {
                return tags.split(',');
            }
        },
        thumbs: {
            square: String,
            small: String,
            medium: String,
            original: String
        },
        files: [
            { type : Schema.ObjectId, ref: 'file' }
        ],
        include_downloads: [
            { type : Schema.ObjectId, ref: 'file' }
        ],
        created_date:      { type: Date,    default: Date.now },
        updated_date:      { type: Date },
        responsive:        { type: Boolean, default: true },
        free:              { type: Boolean, default: false },
        browsers:          { type: String,  default: 'IE 8,Opera,Firefox,Chrome,Safari' },
        software_versions: { type: String,  default: '' },
        high_resolution:   { type: String,  default: 'n/a' },
        year:              { type: Number,  default: new Date().getFullYear() },
        memberships: [
            { type : Schema.ObjectId, ref: 'membership' }
        ]
    });

packageSchema
    .virtual('num_downloads')
    .get(function() {
        if (!this.files || !this.include_downloads) {
            return 0;
        }

        var numDownloads = 0, numFiles = this.files.length;
        for (var i = 0; i < numFiles; i++) {
            if (this.include_downloads.indexOf(this.files[i]._id) != -1) {
                numDownloads += this.files[i].num_downloads;
            }
        }
        return numDownloads;
    });

packageSchema.methods.generateSlug = function() {
    return this
                .name
                .toString()
                .toLowerCase()
                .replace(/\s+/g, '-')
                .replace(/[^\w\-]+/g, '')
                .replace(/\-\-+/g, '-')
                .replace(/^-+/, '')
                .replace(/-+$/, '');
};

packageSchema.statics.generateSlug = function(package, cb) {
    var slug = package.slug ? package.slug : package.generateSlug(), schema = this;
    if (slug == '') {
        slug = '-';
    }

    var found = true,
        count = 0,
        findUntilNotFound = function() {
            schema.findOne({
                slug: slug + (count == 0 ? '' : '-' + count)
            }, function(err, t) {
                if (t == null || t._id.equals(package._id)) {
                    found = false;
                    cb(slug + (count == 0 ? '' : '-' + count));
                } else {
                    count++;
                    findUntilNotFound();
                }
            });
        };
    findUntilNotFound();
};

module.exports = mongoose.model('package', packageSchema, 'package');