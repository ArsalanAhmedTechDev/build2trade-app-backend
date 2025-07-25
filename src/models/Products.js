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
    image: {
      type: String,
      required: true,
      maxlength: 100,
    },
    hasSubProducts: {
      type: Boolean,
      default: false,
    },
    isSubProduct: {
      type: Boolean,
      default: false,
    },
    parentId: {
      type: ObjectId,
      default: null,
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

    isHajjUmrahProduct: {
      type: Boolean,
      default: false,
    },
    isRequestCallButton: { type: Boolean, default: false },
    displayOnDashboard: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date },
  },
  { toJSON: { virtuals: true } }
);

/** change below collection name according to the server **/

module.exports = model("Product", defaultSchema, "products");
