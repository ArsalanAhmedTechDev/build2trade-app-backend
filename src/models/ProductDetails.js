const mongoose = require('mongoose');
const { Schema, model } = mongoose;
const ObjectId = mongoose.Types.ObjectId

const sectionSchema = new mongoose.Schema({
    _id : false,
    columns: {
        type: Number,
        required: true
    },
    body: [
        {
            _id : false,
            type: {
                type: String,
                required: true,
                enum: ['text', 'image']
            },
            content: {
                english: {
                    type: String,
                    default: null,
                },
                urdu: {
                    type: String,
                    default: null,
                }
            },
        }
    ]
});

const brochureSchema = new mongoose.Schema({
    _id : false,
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
    description: {
        english: {
            type: String,
            default: null,
            maxlength: 1000,
        },
        urdu: {
            type: String,
            default: null,
            maxlength: 1000,
        }
    },
    image: {
        type: String,
        required: true,
    },
    file: {
        type: String,
        required: true,
    }
});


const defaultSchema = new Schema(
    {
        productId: {
            type: ObjectId,
            default: null,
        },
        bannerImage : {
            type: String,
            required: true,
            maxlength: 100,
        },
        sections : [sectionSchema],
        gallery : {
            type : Array
        },
        brochures : [brochureSchema],
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date},

    },
    { toJSON: { virtuals: true } }
);


/** change below collection name according to the server **/

module.exports = model('ProductDetail', defaultSchema, 'productDetails');
