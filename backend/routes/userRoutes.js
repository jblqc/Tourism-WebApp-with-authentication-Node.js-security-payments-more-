const express = require("express");
const userController = require("../controllers/userController");
const authController = require("../controllers/authenticationController");

const router = express.Router();

/* ---------------------- PUBLIC ROUTES ---------------------- */
router.post("/signup", authController.signup);
router.post("/login", authController.login);

router.post("/send-email-code", authController.sendEmailCode);
router.post("/verify-email-code", authController.verifyEmailCode);
router.post("/check-phone", authController.checkPhoneUnique);

router.post("/send-otp", authController.sendOtp);
router.post("/verify-otp", authController.verifyOtp);

router.get("/logout", authController.logout);

router.post("/forgotPassword", authController.forgotPassword);
router.patch("/resetPassword/:token", authController.resetPassword);

/* ---------------------- PROTECTED ROUTES ---------------------- */
router.use(authController.protect);
/* PHONE VERIFICATION */
router.post(
  "/send-phone-verification-otp",
  authController.sendPhoneVerificationOtp
);

router.post("/verify-phone-otp", authController.verifyPhoneOtp);
router.patch("/updateMyPassword", authController.updatePassword);

router.get("/me", userController.getMe, userController.getUser);

router.patch(
  "/updateMe",
  userController.uploadUserPhoto,
  userController.resizeUserPhoto,
  userController.updateMe
);

router.delete("/deleteMe", userController.deleteMe);

/* ---------------------- ADMIN ROUTES ---------------------- */
router.route("/").get(userController.getAllUsers);

router
  .route("/:id")
  .get(userController.getUser)
  .delete(authController.restrictTo("admin"), userController.deleteUser)
  .patch(authController.restrictTo("admin"), userController.updateUser);

module.exports = router;
