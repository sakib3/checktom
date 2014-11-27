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

var SignupSchema = new Schema({
    email: {
        type: String,
        required: [true, 'Email is required.' ],
        unique: [true, 'This email is already registered'],
        index: true
    },
    created_at: {
        type: Date
    },
    updated_at: {
        type: Date,
        default: Date.now
    },
    number_of_friends: Number,
    shared: {
        type: Boolean,
        default: false
    }
})
SignupSchema.set('toObject',{getters: true});


/**
 * Methods
 */

mongoose.model('SignupUser', SignupSchema)