const mongoose = require("mongoose");
const { Schema, model } = mongoose;
const ObjectId = mongoose.Types.ObjectId;

const defaultSchema = new Schema(
  {
    department: {
      id: {
        type: Number,
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
    },
    complaintType: {
      id: {
        type: Number,
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
    },
    title: {
      english: {
        type: String,
        default: null,
        maxlength: 1000,
      },
      urdu: {
        type: String,
        default: null,
        maxlength: 1000,
      },
    },
    description: {
      english: {
        type: String,
        default: null,
        maxlength: 10000,
      },
      urdu: {
        type: String,
        default: null,
        maxlength: 10000,
      },
    },
    status: {
      type: String,
      required: true,
      enum: ["active", "Inactive"],
      default: "active",
    },
    createdBy: {
      type: ObjectId,
      default: null,
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date },
  },
  { toJSON: { virtuals: true } }
);

/** change below collection name according to the server **/

module.exports = model("ComplaintTypes", defaultSchema, "complaintTypes");
