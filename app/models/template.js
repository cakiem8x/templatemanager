var mongoose       = require('mongoose'),
    Schema         = mongoose.Schema,
    templateSchema = new Schema({
        name: { type: String, default: '' },
        demo_url: { type: String, default: '' },
        description: { type: String, default: '' },
        thumb: String,
        files: [{
            path: { type: String, default: '' },
            size: { type: Number, default: '' },
            num_downloads: { type: Number, default: 0 }
        }],
        created_date: { type: Date, default: Date.now },
        responsive: { type: Boolean, default: true }
    });

module.exports = mongoose.model('template', templateSchema);