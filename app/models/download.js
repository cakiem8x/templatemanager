/**
 * Templates/Extensions manager. Powered by MEAN stack
 *
 * @link    http://github.com/nghuuphuoc/templatemanager
 * @author  http://twitter.com/nghuuphuoc
 */

var mongoose       = require('mongoose'),
    Schema         = mongoose.Schema,
    downloadSchema = new Schema({
        package: { type : Schema.ObjectId, ref: 'package' },
        file: { type : Schema.ObjectId, ref: 'file' },
        user_name: { type: String, default: '' },
        downloaded_date: { type: Date, default: Date.now },
        ip: { type: String, default: '' },
        browser: { type: String, default: '' }
    });

module.exports = mongoose.model('download', downloadSchema, 'download');