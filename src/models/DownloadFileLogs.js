const mongoose = require("mongoose");
const { Schema, model } = mongoose;
const ObjectId = mongoose.Types.ObjectId;

const defaultSchema = new Schema(
  {
    membershipNumber: {
      type: String,
      default: null,
      maxlength: 100,
    },
    serialNumber: {
      type: Number,
      default: null,
    },
    fileTitle: {
      type: String,
      default: null,
      maxlength: 100,
    },
    logStatus: {
      type: String,
      default: null,
      maxlength: 100,
    },
    status: {
      type: String,
      required: true,
      enum: ["active", "archived"],
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

module.exports = model("DownloadFileLogs", defaultSchema, "downloadFileLogs");
