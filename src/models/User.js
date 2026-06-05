const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },

    password: {
      type: String
    },

    googleId: {
      type: String
    },

    profileImage: {
      type: String,
      default: ""
    },

    phone: {
      type: String,
      default: ""
    },

    location: {
      type: String,
      default: ""
    },

    bio: {
      type: String,
      default: ""
    },

    role: {
      type: String,
      enum: ["USER", "ADMIN"],
      default: "USER"
    },

    isVerified: {
      type: Boolean,
      default: true
    },

    resetPasswordToken: {
      type: String,
      default: null
    },

    resetPasswordExpires: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model(
  "User",
  userSchema
);