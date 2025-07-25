const mongoose = require("mongoose");
const { Schema, model } = mongoose;
const ObjectId = mongoose.Types.ObjectId;

const defaultSchema = new Schema(
  {
    overallExperience: {
      type: String,
      default: null,
      maxlength: 100,
    },
    generalFeedback: {
      type: String,
      default: null,
      maxlength: 100,
    },
    fifthPillarExperience: {
      type: String,
      default: null,
      maxlength: 100,
    },
    productSatisfaction: {
      type: String,
      default: null,
      maxlength: 100,
    },
    serviceQuality: {
      type: String,
      default: null,
      maxlength: 100,
    },
    comment: {
      type: String,
      default: null,
      maxlength: 1000,
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

module.exports = model("Feedback", defaultSchema, "feedbacks");
