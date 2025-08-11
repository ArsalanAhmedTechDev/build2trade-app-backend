const mongoose = require("mongoose");
const { Schema, model } = mongoose;
const ObjectId = mongoose.Types.ObjectId;

const projectSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      maxlength: 1000,
    },
    postCode: {
      type: String,
      default: null,
      maxlength: 20,
    },
    description: {
      type: String,
      default: null,
      maxlength: 10000,
    },
    attachments: [
      {
        fileUrl: {
          type: String, // file URL
        },
      },
    ],

    trades: [
      {
        tradeId: {
          type: ObjectId,
          ref: "Trade",
          required: true,
        },
        description: {
          type: String,
          default: null,
          maxlength: 10000,
        },
        subTradeIds: [
          {
            type: ObjectId,
            ref: "SubTrade",
          },
        ],
        startDate: {
          type: Date,
          default: null,
        },
        endDate: {
          type: Date,
          default: null,
        },
        estimatedBudget: {
          type: Number,
          default: null,
        },
      },
    ],
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
      ref: "User",
      default: null,
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date },
  },
  { toJSON: { virtuals: true } }
);

module.exports = model("Project", projectSchema, "projects");
