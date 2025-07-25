const mongoose = require("mongoose");
const { Schema, model } = mongoose;
const ObjectId = mongoose.Types.ObjectId;

const defaultSchema = new Schema(
  {
    title: {
      english: {
        type: String,
        default: null,
        maxlength: 200,
      },
      urdu: {
        type: String,
        default: null,
        maxlength: 200,
      },
    },
    description: {
      english: {
        type: String,
        default: null,
        maxlength: 3000,
      },
      urdu: {
        type: String,
        default: null,
        maxlength: 3000,
      },
    },
    status: {
      type: String,
      required: true,
      enum: ["pending", "active", "archived"],
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

module.exports = model("Faq", defaultSchema, "faqs");
