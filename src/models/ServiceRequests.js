const mongoose = require("mongoose");
const { Schema, model } = mongoose;
const ObjectId = mongoose.Types.ObjectId;

const defaultSchema = new Schema(
  {
    title: {
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
    description: {
      english: {
        type: String,
        default: null,
        maxlength: 10000,
      },
      urdu: {
        type: String,
        default: null,
        maxlength: 10000,
      },
    },
    category: {
      id: {
        type: Number,
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
    },
    subCategory: {
      id: {
        type: Number,
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
    },
    ISM: {
      id: {
        type: Number,
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
    },
    tags: {
      english: {
        type: [
          {
            label: { type: String, required: false },
            value: { type: String, required: false },
          },
        ],
        required: false,
      },
      urdu: {
        type: [
          {
            label: { type: String, required: false },
            value: { type: String, required: false },
          },
        ],
        required: false,
      },
    },
    type: {
      type: String,
      required: true,
      enum: ["manual", "digital"],
      default: "manual",
    },
    content: {
      english: {
        type: String,
        default: null,
      },
      urdu: {
        type: String,
        default: null,
      },
    },
    files: {
      english: {
        type: [
          {
            label: { type: String, required: false },
            value: { type: String, required: false },
            file: { type: String, required: false },
          },
        ],
        required: false,
      },
      urdu: {
        type: [
          {
            label: { type: String, required: false },
            value: { type: String, required: false },
            file: { type: String, required: false },
          },
        ],
        required: false,
      },
    },
    designForm: {
      type: String,
      default: null,
    },
    isZakatDoc: {
      type: Boolean,
      default: false,
    },
    isAgent: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      required: true,
      enum: ["active", "Inactive"],
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

module.exports = model("ServiceRequest", defaultSchema, "serviceRequests");
