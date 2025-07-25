// require modules
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId;

// define schema for role model
const defaultSchema = new Schema({
  notificationContentId: {
    type: ObjectId,
    default: null,
  },
  userId: {
    type: ObjectId,
    default: null,
  },
  readStatus: { type: Boolean, default: false },
  createdBy: {
    type: ObjectId,
    default: null,
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: null },
});

defaultSchema.set("toJSON", { virtuals: true });
module.exports = mongoose.model(
  "NotificationStatus",
  defaultSchema,
  "notificationStatus"
);
