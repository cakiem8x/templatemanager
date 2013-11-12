var mongoose   = require('mongoose'),
    Schema     = mongoose.Schema,
    crypto     = require('crypto'),
    userSchema = new Schema({
        first_name: { type: String, default: '' },
        last_name: { type: String, default: '' },
        username: { type: String, default: '' },
        email: { type: String, default: '' },
        hashed_password: { type: String, default: '' },
        salt: { type: String, default: '' },
        role: { type: String, default: 'admin' }
    });

userSchema
    .virtual('password')
    .set(function(password) {
        this._password       = password;
        this.salt            = this.createSalt();
        this.hashed_password = this.encryptPassword(password);
    })
    .get(function() {
        return this._password;
    });

userSchema.methods = {
    createSalt: function() {
        return Math.round((new Date().valueOf() * Math.random())) + '';
    },

    encryptPassword: function(password) {
        if (!password) {
            return '';
        }
        try {
            return crypto.createHmac('sha1', this.salt).update(password).digest('hex');
        } catch(err) {
            return '';
        }
    },

    verifyPassword: function(plainText) {
        return this.encryptPassword(plainText) == this.hashed_password;
    }
};

/**
 * Check if the username / email address is taken or not
 */
userSchema.statics.isAvailable = function(user, field, callback) {
    var criteria = {};
    criteria[field] = user[field];
    this.count(criteria, function(err, total) {
        callback(!err && total == 0);
    });
};

module.exports = mongoose.model('user', userSchema);