/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    crypto = require('crypto'),
    _ = require('underscore'),
    authTypes = ['facebook'];

/**
 * User Schema
 */

var UserSchema = new Schema({
    name: String,
    authorArticleId:{type:Schema.ObjectId},
    university:String,
    city:String,
    profilePicture:String,
    email: {
        type: String,
        required: [true, 'Email is required.' ],
        unique: [true, 'This email is already registered'],
        index: true,
        pattern: 'email'
    },
    username: String,
    provider: String,
    hashed_password: {
        type: String,
        required: [true, 'Password is required']
    },
    salt: String,
    created_at: {
        type: Date
    },
    updated_at: {
        type: Date,
        default: Date.now
    },
    facebook: {},
    FBAccessToken:String,
    FBRefreshToken:String,
    FBID:String,
    verified: { type: Boolean, default: false },
    uniqueRecoveryString: String
})
UserSchema.set('toObject', { getters: true });

/**
 * Virtuals
 */

UserSchema
    .virtual('password')
    .set(function (password) {
        this._password = password
        this.salt = this.makeSalt()
        this.hashed_password = this.encryptPassword(password)
    })
    .get(function () {
        return this._password
    });

UserSchema.virtual('repeat_password')
    .get(function () {
        return this._repeatPassword;
    })
    .set(function (value) {
        this._repeatPassword = value;
    });

/**
 * Validations
 */
var total;
var emailNotExists = function (email, _callback) {
    mongoose.model('User', UserSchema).
        count({
            email: email
        }, function (err, count) {
            if (err)
                return _callback(count);
            return _callback(null, ((count == 0) ? true : false));
        });
};

var validatePresenceOf = function (value) {
    return value && value.length
}


/**
 * Validations
 * the below 4 validations only apply if you are signing up traditionally
 * if you are authenticating by any of the oauth strategies, don't validate
 */
/*
UserSchema.path('email').validate(function (email) {
    // if you are authenticating by any of the oauth strategies, don't validate
    if (authTypes.indexOf(this.provider) !== -1) return true

    return email.length
}, 'Email cannot be blank')

UserSchema.path('email').validate(function (email) {
    // if you are authenticating by any of the oauth strategies, don't validate
    if (authTypes.indexOf(this.provider) !== -1) return true

    if (emailExists(email))
        return false;
    else
        return true;
}, 'Email is registered')
*/
/**
 * Pre-save hook
 */

UserSchema.pre('save', function (next) {
    if (!this.isNew) return next()

    if ((!validatePresenceOf(this.password)) && authTypes.indexOf(this.provider) === -1) {
        next(new Error('Invalid password'));
    } else
        next()
})
/**
 * Methods
 */

UserSchema.methods = {

    /**
     * Authenticate - check if the passwords are the same
     *
     * @param {String} plainText
     * @return {Boolean}
     * @api public
     */

    authenticate: function (plainText) {
        return this.encryptPassword(plainText) === this.hashed_password
    },

    /**
     * Make salt
     *
     * @return {String}
     * @api public
     */

    makeSalt: function () {
        return Math.round((new Date().valueOf() * Math.random())) + ''
    },

    /**
     * Encrypt password
     *
     * @param {String} password
     * @return {String}
     * @api public
     */

    encryptPassword: function (password) {
        if (!password) return ''
        return crypto.createHmac('sha1', this.salt).update(password).digest('hex')
    }
}

mongoose.model('User', UserSchema)