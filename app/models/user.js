var mongoose   = require('mongoose'),
    Schema     = mongoose.Schema,
    crypto     = require('crypto'),
    userSchema = new Schema({
        username: { type: String, default: '' },
        email: { type: String, default: '' },
        hashed_password: { type: String, default: '' },
        salt: { type: String, default: '' }
    });

userSchema
    .virtual('password')
    .set(function(password) {
        this._password       = password;
        this.salt            = this.createSalt();
        this.hashed_password = this.encryptPassword(password);
        console.log(password, this.salt, this.hashed_password);
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

module.exports = mongoose.model('user', userSchema);