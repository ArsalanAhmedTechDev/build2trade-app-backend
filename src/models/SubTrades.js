const mongoose = require("mongoose");
const { Schema, model } = mongoose;
const ObjectId = mongoose.Types.ObjectId;

const subTradeSchema = new Schema(
  {
    tradeId: {
      type: ObjectId,
      required: true,
      ref: "Trade",
    },
    title: {
      type: String,
      default: null,
      maxlength: 1000,
    },
    description: {
      type: String,
      default: null,
      maxlength: 10000,
    },
    type: {
      type: String,
      required: true,
      enum: ["manual", "automated"],
      default: "manual",
    },
    status: {
      type: String,
      required: true,
      enum: ["active", "inactive"],
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

module.exports = model("SubTrade", subTradeSchema, "subTrades");

subTradeSchema.virtual("trade", {
  ref: "Trade",
  localField: "tradeId",
  foreignField: "_id",
  justOne: true,
});
