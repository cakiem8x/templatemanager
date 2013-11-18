var mongoose       = require('mongoose'),
    Schema         = mongoose.Schema,
    templateSchema = new Schema({
        name: { type: String, default: '' },
        slug: { type: String, default: '' },
        demo_url: { type: String, default: '' },
        themes: [{
            name: { type: String, default: '' },
            color: { type: String, default: '' },
            demo_url: { type: String, default: '' }
        }],
        description: { type: String, default: '' },
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
        files: [{
            name: { type: String, default: '' },
            description: { type: String, default: '' },
            path: { type: String, default: '' },
            size: { type: Number, default: 0 },
            num_downloads: { type: Number, default: 0 },
            last_modified: { type: Date, default: Date.now },
            uploaded_date: { type: Date, default: Date.now }
        }],
        created_date: { type: Date, default: Date.now },
        responsive: { type: Boolean, default: true },
        free: { type: Boolean, default: false },
        browsers: { type: String, default: 'IE 8,Opera,Firefox,Chrome,Safari' },
        software_versions: { type: String, default: '' },
        high_resolution: { type: String, default: 'n/a' },
        year: { type: Number, default: new Date().getFullYear() },
        memberships: [
            { type : Schema.ObjectId, ref: 'membership' }
        ]
    });

templateSchema
    .virtual('num_downloads')
    .get(function() {
        var numDownloads = 0, numFiles = this.files.length;
        for (var i = 0; i < numFiles; i++) {
            numDownloads += this.files[i].num_downloads;
        }
        return numDownloads;
    });

templateSchema.methods.generateSlug = function() {
    return this.name.toString().toLowerCase()
                    .replace(/\s+/g, '-')
                    .replace(/[^\w\-]+/g, '')
                    .replace(/\-\-+/g, '-')
                    .replace(/^-+/, '')
                    .replace(/-+$/, '');
};

templateSchema.statics.generateSlug = function(template, cb) {
    var slug = template.slug ? template.slug : template.generateSlug(), schema = this;
    if (slug == '') {
        slug = '-';
    }

    var found = true,
        count = 0,
        findUntilNotFound = function() {
            schema.findOne({
                slug: slug + (count == 0 ? '' : '-' + count)
            }, function(err, t) {
                if (t == null || t._id == template._id) {
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

module.exports = mongoose.model('template', templateSchema, 'template');