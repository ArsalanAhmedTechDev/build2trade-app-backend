const mongoose = require("mongoose");
const { Schema, model } = mongoose;
const ObjectId = mongoose.Types.ObjectId;

const defaultSchema = new Schema(
  {
    title: {
      type: String,
      default: null,
      maxlength: 1000,
    },
    membershipNo: {
      type: String,
      default: null,
      maxlength: 1000,
    },
    categoryId: {
      type: Number,
      required: true,
    },
    subCategoryId: {
      type: Number,
      required: true,
    },
    ISMId: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      default: null,
      maxlength: 10000,
    },
    type: {
      type: String,
      required: true,
      enum: ["manual", "digital"],
      default: "manual",
    },
    uploads: {
      type: Object,
    },
    status: {
      type: String,
      required: true,
      enum: ["active", "Inactive"],
      default: "active",
    },
    requestFormSentResponse: {
      type: Object,
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

module.exports = model("RequestForm", defaultSchema, "requestForms");
