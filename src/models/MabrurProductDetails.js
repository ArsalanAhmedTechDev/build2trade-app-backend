const mongoose = require('mongoose');
const { Schema, model } = mongoose;
const ObjectId = mongoose.Types.ObjectId

const defaultSchema = new Schema(
    {
        productId: {
            type: ObjectId,
            default: null,
        },
        age: {
          type: Number
        },
        term: {
            type: Number
        },
        growthRate: {
            type: String
        },
        annualContribution: {
            type: Number
        },
        deathBenefit: {
            type: Number
        },
        years : {
            type : Array
        },
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date},

    },
    { toJSON: { virtuals: true } }
);


/** change below collection name according to the server **/

module.exports = model('MabrurProductDetail', defaultSchema, 'mabrurProductDetails');
