// -----------------------------------------------------------------------------
// IMPORTS
// -----------------------------------------------------------------------------
const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const crypto = require("crypto");
const User = require("../models/userModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const Email = require("../utils/email");
const { sendSms } = require("../utils/sms");

const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Twilio client (only define ONCE)
const twilio = require("twilio");
const twilio_client = twilio(
  process.env.TWILIO_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// -----------------------------------------------------------------------------
// HELPERS
// -----------------------------------------------------------------------------

/* SIGN TOKEN */
const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

/* SEND TOKEN + COOKIE */
const createSendToken = (user, statusCode, req, res) => {
  const token = signToken(user._id);

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 3600 * 1000
    ),
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  };

  res.cookie("jwt", token, cookieOptions);
  user.password = undefined;

  res.status(statusCode).json({
    status: "success",
    token,
    data: { user },
  });
};

/* Normalizes phone (+63) */
const normalizePhone = (phone) => {
  if (!phone) return phone;
  return phone.trim();
};

/* This is originally export function (browser style), but kept EXACT logic */
const formatPhone = (num) => {
  let n = num.replace(/\D/g, "");
  if (!n.startsWith("63")) n = "63" + n.replace(/^0+/, "");
  return "+".concat(n);
};

// -----------------------------------------------------------------------------
// AUTH CONTROLLERS
// -----------------------------------------------------------------------------

/* SIGNUP */
exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create(req.body);
  await new Email(
    newUser,
    `${req.protocol}://${req.get("host")}/me`
  ).sendWelcome();
  createSendToken(newUser, 201, req, res);
});

/* LOGIN */
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password)
    return next(new AppError("Email or password missing", 400));

  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.isValidPassword(password, user.password)))
    return next(new AppError("Invalid email or password", 401));

  createSendToken(user, 200, req, res);
});

/* LOGOUT */
exports.logout = (req, res) => {
  res.cookie("jwt", "loggedout", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    expires: new Date(Date.now() + 10 * 1000),
  });
  res.status(200).json({ status: "success" });
};

/* PROTECT ROUTES */
exports.protect = catchAsync(async (req, res, next) => {
  let token =
    req.headers.authorization?.startsWith("Bearer") &&
    req.headers.authorization.split(" ")[1];

  if (!token && req.cookies.jwt) token = req.cookies.jwt;

  if (!token || token === "loggedout")
    return next(new AppError("You are not logged in", 401));

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  const currentUser = await User.findById(decoded.id);
  if (!currentUser)
    return next(new AppError("The user no longer exists.", 401));

  if (currentUser.changedPasswordAfter(decoded.iat))
    return next(new AppError("Password recently changed. Login again.", 401));

  req.user = currentUser;
  res.locals.user = currentUser;
  next();
});

/* RESTRICT TO ROLE */
exports.restrictTo =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role))
      return next(new AppError("No permission", 403));
    next();
  };

/* FORGOT PASSWORD */
exports.forgotPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) return next(new AppError("User does not exist!", 404));

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  try {
    const resetUrl = `${req.protocol}://${req.get("host")}/api/v1/users/resetPassword/${resetToken}`;
    await new Email(user, resetUrl).sendPasswordReset();

    res
      .status(200)
      .json({ status: "success", message: "Token sent to email!" });
  } catch (err) {
    user.passwordResetToken = user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    next(new AppError("Error sending email", 500));
  }
});

/* RESET PASSWORD */
exports.resetPassword = catchAsync(async (req, res, next) => {
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) return next(new AppError("Token invalid or expired", 400));

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save();
  createSendToken(user, 200, req, res);
});

/* UPDATE PASSWORD */
exports.updatePassword = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("+password");

  if (!(await user.isValidPassword(req.body.passwordCurrent, user.password)))
    return next(new AppError("Incorrect password", 401));

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  createSendToken(user, 200, req, res);
});

/* IS LOGGED IN */
exports.isLoggedIn = catchAsync(async (req, res, next) => {
  if (req.cookies.jwt && req.cookies.jwt !== "loggedout") {
    try {
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );

      const currentUser = await User.findById(decoded.id);
      if (!currentUser || currentUser.changedPasswordAfter(decoded.iat))
        return next();

      res.locals.user = currentUser;
      req.user = currentUser;
      return next();
    } catch (err) {
      return next();
    }
  }
  next();
});

/* GOOGLE LOGIN */
exports.googleLogin = catchAsync(async (req, res, next) => {
  const { credential } = req.body;
  if (!credential) return next(new AppError("No Google credential", 400));

  const ticket = await client.verifyIdToken({
    idToken: credential,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();
  let user = await User.findOne({ email: payload.email });

  if (!user) {
    user = await User.create({
      name: payload.name,
      email: payload.email,
      photo: payload.picture,
      provider: "google",
    });
  }

  createSendToken(user, 200, req, res);
});

// -----------------------------------------------------------------------------
// EMAIL LOGIN (MAGIC CODE)
// -----------------------------------------------------------------------------

exports.sendEmailCode = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  if (!email) return next(new AppError("Email required", 400));

  const user = await User.findOne({ email });
  if (!user) return next(new AppError("No user with that email", 404));

  const code = String(Math.floor(100000 + Math.random() * 900000));
  const hashed = crypto.createHash("sha256").update(code).digest("hex");

  user.emailLoginCode = hashed;
  user.emailLoginExpires = Date.now() + 10 * 60 * 1000;
  await user.save({ validateBeforeSave: false });

  await new Email(user, null).sendLoginCode(code);

  res.status(200).json({ status: "success", message: "Login code sent!" });
});

exports.verifyEmailCode = catchAsync(async (req, res, next) => {
  const { email, code } = req.body;

  if (!email || !code) return next(new AppError("Email & code required", 400));

  const hashed = crypto.createHash("sha256").update(code).digest("hex");

  const user = await User.findOne({
    email,
    emailLoginCode: hashed,
    emailLoginExpires: { $gt: Date.now() },
  }).select("+emailLoginCode +emailLoginExpires");

  if (!user) return next(new AppError("Invalid or expired code", 400));

  user.emailLoginCode = undefined;
  user.emailLoginExpires = undefined;
  await user.save({ validateBeforeSave: false });

  createSendToken(user, 200, req, res);
});

// -----------------------------------------------------------------------------
// PHONE VERIFICATION (Account Page)
// -----------------------------------------------------------------------------

exports.sendPhoneVerificationOtp = catchAsync(async (req, res, next) => {
  const { phoneNumber } = req.body;
  const user = await User.findById(req.user.id);

  if (!phoneNumber) return next(new AppError("Phone required", 400));

  const exists = await User.findOne({
    phoneNumber,
    _id: { $ne: user._id },
  });

  if (exists) return next(new AppError("Phone already taken", 400));

  // Send OTP using Twilio Verify (same as login OTP)
  await twilio_client.verify.v2
    .services(process.env.TWILIO_VERIFY_SID)
    .verifications.create({
      to: phoneNumber,
      channel: "sms",
    });

  // Save temp phone + pending OTP
  user.phoneNumber = phoneNumber;
  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    status: "success",
    message: "Verification code sent",
  });
});
exports.verifyPhoneOtp = catchAsync(async (req, res, next) => {
  const { code } = req.body;
  const user = await User.findById(req.user.id);

  if (!code) return next(new AppError("OTP required", 400));

  const result = await twilio_client.verify.v2
    .services(process.env.TWILIO_VERIFY_SID)
    .verificationChecks.create({
      to: user.phoneNumber,
      code,
    });

  if (result.status !== "approved")
    return next(new AppError("Invalid or expired OTP", 400));

  user.phoneVerified = true;
  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    status: "success",
    message: "Phone verified!",
  });
});

// -----------------------------------------------------------------------------
// SMS LOGIN OTP
// -----------------------------------------------------------------------------

exports.sendOtp = catchAsync(async (req, res, next) => {
  const { phone } = req.body;
  if (!phone) return next(new AppError("Phone is required", 400));

  const user = await User.findOne({ phoneNumber: phone });
  if (!user) return next(new AppError("No user found", 404));

  await twilio_client.verify.v2
    .services(process.env.TWILIO_VERIFY_SID)
    .verifications.create({
      to: phone,
      channel: "sms",
    });

  res.status(200).json({ status: "success", message: "OTP sent via SMS!" });
});

exports.verifyOtp = catchAsync(async (req, res, next) => {
  const { phone, code } = req.body;

  if (!phone || !code) return next(new AppError("Missing phone or code", 400));

  const result = await twilio_client.verify.v2
    .services(process.env.TWILIO_VERIFY_SID)
    .verificationChecks.create({
      to: phone,
      code,
    });

  if (result.status !== "approved")
    return next(new AppError("Invalid or expired OTP", 400));

  const user = await User.findOne({ phoneNumber: phone });
  if (!user) return next(new AppError("User not found", 404));

  createSendToken(user, 200, req, res);
});
exports.checkPhoneUnique = catchAsync(async (req, res, next) => {
  const { phone } = req.body;

  if (!phone) return next(new AppError("Phone required", 400));

  const exists = await User.findOne({ phoneNumber: phone });

  res.status(200).json({
    status: "success",
    unique: !exists, // true if available
    message: exists ? "Phone already used" : "Phone available",
  });
});
