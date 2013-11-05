var mongoose       = require('mongoose'),
    Schema         = mongoose.Schema,
    templateSchema = new Schema({
        name: { type: String, default: '' },
        demo_url: { type: String, default: '' },
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
            path: { type: String, default: '' },
            size: { type: Number, default: 0 },
            num_downloads: { type: Number, default: 0 },
            last_modified: { type: Date, default: Date.now },
            uploaded_date: { type: Date, default: Date.now }
        }],
        created_date: { type: Date, default: Date.now },
        responsive: { type: Boolean, default: true },
        free: { type: Boolean, default: false },
        year: { type: Number, default: new Date().getFullYear() }
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

module.exports = mongoose.model('template', templateSchema);