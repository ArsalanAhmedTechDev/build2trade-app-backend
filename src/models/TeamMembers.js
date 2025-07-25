const mongoose = require('mongoose');
const { Schema, model } = mongoose;
const ObjectId = mongoose.Types.ObjectId

const defaultSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            maxlength: 100,
        },
        image: {
            type: String,
            required: true,
            maxlength: 100,
        },
        position: {
            type: String,
            required: true,
            maxlength: 100,
        },
        status: {
            type: String,
            required: true,
            enum: ['pending', 'active', 'archived'],
            default: 'active',
        },
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date},

    },
    { toJSON: { virtuals: true } }
);


/** change below collection name according to the server **/

module.exports = model('TeamMember', defaultSchema, 'teamMembers');
