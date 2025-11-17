const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "A user must have a name"],
    trim: true,
    maxlength: [40, "A user name must be less than 40 characters"],
    minlength: [3, "A user name must be more than 3 characters"],
  },

  email: {
    type: String,
    required: [true, "A user must have an email"],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, "A user email must be valid"],
  },

  photo: {
    type: String,
    default: "default.jpg",
  },

  provider: {
    type: String,
    enum: ["email", "google"],
    default: "email",
  },
  phoneNumber: {
    type: String,
    unique: true,
    sparse: true, // allows null / undefined
  },
  phoneVerified: {
    type: Boolean,
    default: false,
  },

  // EMAIL USERS ONLY
  password: {
    type: String,
    required: function () {
      return this.provider === "email";
    },
    minlength: [8, "Password must be at least 8 characters"],
    select: false,
  },

  passwordConfirm: {
    type: String,
    required: function () {
      return this.provider === "email";
    },
    validate: {
      validator: function (val) {
        return this.provider !== "email" || val === this.password;
      },
      message: "Passwords must match",
    },
    select: false,
  },

  /* --------------------------------------------
      EMAIL LOGIN CODE (for Magic Login)
  -------------------------------------------- */
  emailLoginCode: {
    type: String,
    select: false,
  },
  emailLoginExpires: {
    type: Date,
    select: false,
  },
  otpCode: {
    type: String,
    select: false,
  },
  otpCodeExpires: {
    type: Date,
    select: false,
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,

  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

/* --------------------------------------------
   HASH PASSWORD (email users only)
-------------------------------------------- */
userSchema.pre("save", async function (next) {
  if (this.provider !== "email") return next();
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

/* UPDATE passwordChangedAt */
userSchema.pre("save", function (next) {
  if (this.provider !== "email") return next();
  if (!this.isModified("password") || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

/* CHECK PASSWORD */
userSchema.methods.isValidPassword = async function (
  candidatePassword,
  userPassword
) {
  if (this.provider !== "email") return false;
  return bcrypt.compare(candidatePassword, userPassword);
};

userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (!this.passwordChangedAt) return false;

  return JWTTimestamp < parseInt(this.passwordChangedAt.getTime() / 1000, 10);
};

/* --------------------------------------------
   PASSWORD RESET TOKEN
-------------------------------------------- */
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

module.exports = mongoose.model("User", userSchema);
