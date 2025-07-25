const mongoose = require("mongoose");
const moment = require("moment");
const { Schema, model } = mongoose;
const ObjectId = mongoose.Types.ObjectId;

const userSchema = new Schema(
  {
    fullName: {
      type: String,
      required: true,
      maxlength: 50,
    },
    username: {
      type: String,
      default: null,
      maxlength: 50,
    },
    isdCode: {
      type: String,
      default: "92",
      min: 1,
      max: 3,
    },
    phoneNumber: {
      type: String,
      required: true,
      maxlength: 15,
    },
    cnic: {
      type: String,
      required: true,
      // match: [
      //     /^\d{5}-\d{7}-\d{1}$/,
      //     'Invalid format. Should be in the format xxxxx-xxxxxxx-x',
      // ],
      unique: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      match: [
        /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        "Invalid email format",
      ],
      // unique: true,
    },
    password: {
      type: String,
    },
    roleId: {
      type: ObjectId,
      required: true,
      ref: "Role",
    },
    image: { type: String },
    preferredLanguage: { type: String, default: "english" },
    avatar: {
      originalName: {
        type: String,
        default: null,
      },
      fileName: {
        type: String,
        default: null,
      },
    },
    bookACall: {
      type: Boolean,
      default: false,
    },
    isPhoneNumberValidated: {
      type: Boolean,
      default: false,
    },
    notifications: {
      type: Boolean,
      default: true,
    },

    status: {
      type: String,
      required: true,
      enum: ["pending", "active", "archived"],
      default: "active",
    },
    fcmToken: {
      type: String,
      required: false,
    },
    fcmTokenWeb: {
      type: String,
      required: false,
    },
    deviceId: {
      type: String,
      required: false,
    },
    channel: {
      type: String,
      enum: ["web", "android", "ios"],
      default: "web",
    },
    loginAttempts: { type: Number, default: 0 },
    // isLocked: { type:Boolean, default:false},
    lockedAt: Date,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    loginAt: { type: Date, default: Date.now },

    /** New Fields added **/

    createdBy: {
      type: ObjectId,
      default: null,
    },
    isManuallyCreated: {
      type: Boolean,
      default: false,
    },
    isPasswordCreated: {
      type: Boolean,
      default: true,
    },
  },
  { toJSON: { virtuals: true } }
);

userSchema.virtual("avatarUrl").get(function () {
  return this.avatar.fileName;
});

userSchema.virtual("role", {
  ref: "Role",
  localField: "roleId",
  foreignField: "_id",
  justOne: true,
});

userSchema.virtual("isLocked").get(function () {
  const now = moment();
  const diff = now.diff(moment(this.lockedAt), "minutes");
  return !!(this.lockedAt && diff < 10);
});

userSchema.methods.incrementLoginAttempts = async function () {
  const now = moment();
  const diff = now.diff(moment(this.lockedAt), "minutes");
  const lockExpired = !!(this.lockedAt && diff > 10);

  if (lockExpired) {
    await this.updateOne({
      $set: { loginAttempts: 0 },
      $unset: { lockedAt: 1 },
    });
    return;
  }

  const updates = { $inc: { loginAttempts: 1 } };
  const needToLock = !!(this.loginAttempts + 1 >= 10 && !this.isLocked);

  if (needToLock) {
    updates.$set = { lockedAt: moment() };
  }

  await this.updateOne(updates);
  return;
};

/** change below collection name according to the server **/

module.exports = model("Customer", userSchema, "customers");
