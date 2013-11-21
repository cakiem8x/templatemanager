var mongoose   = require('mongoose'),
    Schema     = mongoose.Schema,
    fileSchema = new Schema({
        name: { type: String, default: '' },
        description: { type: String, default: '' },
        path: { type: String, default: '' },
        size: { type: Number, default: 0 },
        num_downloads: { type: Number, default: 0 },
        last_modified: { type: Date, default: Date.now },
        uploaded_user: { type: String, default: '' },
        uploaded_date: { type: Date, default: Date.now },
        last_download: { type: Date, default: Date.now }
    });

module.exports = mongoose.model('file', fileSchema, 'file');