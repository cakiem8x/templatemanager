/**
 * Templates/Extensions manager. Powered by MEAN stack
 *
 * @link    http://github.com/nghuuphuoc/templatemanager
 * @author  http://twitter.com/nghuuphuoc
 */

var mongoose     = require('mongoose'),
    Schema       = mongoose.Schema,
    optionSchema = new Schema({
        key:   { type: String, default: '' },
        value: { type: String, default: '' }
    });

module.exports = mongoose.model('option', optionSchema, 'option');