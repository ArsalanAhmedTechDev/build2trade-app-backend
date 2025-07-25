// require modules
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId;

// define schema for book a call model
const defaultSchema = new Schema({
  name: {
    type: String,
    default: null,
    maxlength: 100,
  },
  phoneNumber: {
    type: String,
    default: null,
    maxlength: 100,
  },
  email: {
    type: String,
    default: null,
    maxlength: 100,
  },
  city: {
    type: String,
    default: null,
    maxlength: 100,
  },
  job: {
    type: String,
    default: null,
    maxlength: 100,
  },
  designation: {
    type: String,
    default: null,
    maxlength: 100,
  },
  message: {
    type: String,
    default: null,
    maxlength: 100,
  },
  status: {
    type: String,
    enum: ["locked", "active", "archived"],
    default: "active",
  },
  createdBy: {
    type: ObjectId,
    default: null,
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: null },
});

defaultSchema.set("toJSON", { virtuals: true });
module.exports = mongoose.model("BookCall", defaultSchema, "bookCall");
