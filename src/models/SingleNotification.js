// require modules
const mongoose = require("mongoose");
const { Schema, Types } = mongoose;

// Define schema for notifications
const notificationSchema = new Schema(
  {
    agent: {
      agentCodes: { type: [String], default: [] },
      fileName: { type: String, default: null },
      status: { type: String, default: "active" },
    },
    customer: {
      cnics: { type: [String], default: [] },
      fileName: { type: String, default: null },
      status: { type: String, default: "active" },
    },
    expiredAt: { type: Date },
    createdBy: { type: Types.ObjectId, ref: "User" },
  },
  {
    timestamps: true, // Automatically adds createdAt & updatedAt
    toJSON: { virtuals: true },
  }
);

// Export the model
module.exports = mongoose.model(
  "SingleNotification",
  notificationSchema,
  "singleNotifications"
);
