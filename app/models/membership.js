var mongoose         = require('mongoose'),
    Schema           = mongoose.Schema,
    membershipSchema = new Schema({
        pid: { type: Number, default: 0 },
        title: { type: String, default: '' },
        description: { type: String, default: '' }
    });

module.exports = mongoose.model('membership', membershipSchema, 'membership');