/**
 * Templates/Extensions manager. Powered by MEAN stack
 *
 * @link    http://github.com/nghuuphuoc/templatemanager
 * @author  http://twitter.com/nghuuphuoc
 */

var mongoose = require('mongoose'),
    Download = mongoose.model('download'),
    File     = mongoose.model('file'),
    fs       = require('fs');

/**
 * Download file
 */
exports.download = function(req, res) {
    var id = req.param('id');
    File.findOne({ _id: id }).exec(function(err, file) {
        if (err || !file) {
            return res.send('File not found', 404);
        }

        if (!fs.existsSync(file.path)) {
            return res.send('File not found', 404);
        }

        if (!file.free) {
            return res.end('The file is not free for download', 403);
        }

        file.num_downloads++;
        file.last_download = new Date();
        file.save(function(err) {
            if (!err) {
                var download = new Download({
                    package: null,
                    file: id,
                    user_name: '@guest',
                    ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
                    browser: req.headers['user-agent']
                });
                download.save();

                res.setHeader('Content-Description', 'Download file');
                res.setHeader('Content-Type', 'application/octet-stream');
                res.setHeader('Content-Disposition', 'attachment; filename=' + file.name);

                var stream = fs.createReadStream(file.path);
                stream.pipe(res);
            }
        });
    });
};
