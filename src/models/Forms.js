// require modules
const mongoose = require('mongoose')
const Schema = mongoose.Schema
const ObjectId = mongoose.Types.ObjectId

// define schema for role model
const defaultSchema = new Schema({
    title: {
        english: {
            type: String,
            default: null,
            maxlength: 100,
        },
        urdu: {
            type: String,
            default: null,
            maxlength: 100,
        }
    },
    tags: {
        english:{type:Array},
        urdu:{type:Array}
    },
    file:{type:String},
    image:{type:String},
    status: {
        type: String,
        enum: ['locked', 'active', 'archived'],
        default: 'active',
    },
    createdBy: {
        type: ObjectId,
        default: null,
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: null },
})

defaultSchema.set('toJSON', { virtuals: true })
module.exports = mongoose.model('Form', defaultSchema, 'forms')
