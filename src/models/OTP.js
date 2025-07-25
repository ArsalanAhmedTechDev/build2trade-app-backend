const mongoose = require('mongoose')
const Schema = mongoose.Schema
const ObjectId = Schema.Types.ObjectId


//require translations for error, success and validation from helper

const otp = new Schema(
    {        
        phoneNumber: {
            type: String,
            required: true,
        },
        isdCode: {
            type: String,
            default:"92",
            min: 1,
            max: 3,
        },
        receiverId: {
            type: String,
        },
        email: {
            type: String,
        },
        channel: {
            type: String,
        },
        apiToken: {
            type: String,
        },
        otp: {
            type: String,
        },
        expiresIn: {
            type: String,
            required: true,
        },
        tokenUsed: {
            type: Boolean,
            default:false
        },
        createdAt: {
            type: Date,
            default: Date.now,
        },

    },

    { collection: 'otp' }
)


module.exports = mongoose.model('otp', otp)