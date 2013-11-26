/**
 * Templates/Extensions manager. Powered by MEAN stack
 *
 * @link    http://github.com/nghuuphuoc/templatemanager
 * @author  http://twitter.com/nghuuphuoc
 */

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

fileSchema.post('remove', function(file) {
    var Download = mongoose.model('download'),
        Package  = mongoose.model('package');
    Download.remove({ file: file._id }).exec(function() {
        // TODO: Is there a way to update multiple packages as following?
        /*Package.update({
            files: file._id
        }, {
            '$pull': {
                files: file._id
            }
        });*/

        Package.find({ files: file._id }).exec(function(err, packages) {
            for (var i in packages) {
                packages[i].files.remove(file._id);
                packages[i].save();
            }
        });
    });
});

module.exports = mongoose.model('file', fileSchema, 'file');