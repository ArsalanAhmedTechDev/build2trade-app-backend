// require modules
const mongoose = require('mongoose')
const Schema = mongoose.Schema
const ObjectId = mongoose.Types.ObjectId

// define schema for role model
const defaultSchema = new Schema({
    fundId: {
        type: ObjectId,
        default: null,
    },
    bidPrice: {
        type: Number,
        default: null,
    },
    offerPrice: {
        type: Number,
        default: null,
    },
    transactionDate: {
        type: Date,
        default: null,
    },
    status: {
        type: String,
        enum: ['locked', 'active', 'archived'],
        default: 'active',
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: null },
})

defaultSchema.set('toJSON', { virtuals: true })
module.exports =
    mongoose.model('FundPrice', defaultSchema, 'fundPrices')
