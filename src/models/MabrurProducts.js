const mongoose = require("mongoose");
const { Schema, model } = mongoose;
const ObjectId = mongoose.Types.ObjectId;

const defaultSchema = new Schema(
  {
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
      },
    },
    productType: {
      english: {
        type: String,
        default: null,
        maxlength: 100,
      },
      urdu: {
        type: String,
        default: null,
        maxlength: 100,
      },
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
      },
    },
    fileName: {
      type: String,
    },
    status: {
      type: String,
      required: true,
      enum: ["pending", "active", "archived"],
      default: "active",
    },

    isAvailable: {
      type: Boolean,
      default: false,
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

module.exports = model("MabrurProduct", defaultSchema, "mabrurProducts");
