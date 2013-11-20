var mongoose       = require('mongoose'),
    Schema         = mongoose.Schema,
    downloadSchema = new Schema({
        template: { type : Schema.ObjectId, ref: 'template' },
        file: { type : Schema.ObjectId, ref: 'file' },
        user_name: { type: String, default: '' },
        downloaded_date: { type: Date, default: Date.now },
        ip: { type: String, default: '' },
        browser: { type: String, default: '' }
    });

module.exports = mongoose.model('download', downloadSchema, 'download');