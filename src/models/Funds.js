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
    fundCode: {
      type:String,
      default:null
    },
    fundCategoryId: {
        type: ObjectId,
        default: null,
    },
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
module.exports = mongoose.model('Fund', defaultSchema, 'funds')
