// src/hooks/useAuth.js
import { useUserStore } from "../store/useUserStore";

export const useAuth = () => {
  const {
    user,
    token,
    login,
    signup,
    logout,
    updateProfile,
    updatePassword,
    forgotPassword,
    resetPassword,
    deleteAccount,
    googleLogin,

    // OTP
    sendEmailCode,
    verifyEmailCode,
    sendSmsOtp,
    verifySmsOtp,
    checkPhoneUnique,

    // Phone Verification
    sendPhoneVerificationOtp,
    verifyPhoneVerificationOtp,
  } = useUserStore();

  /* -------------------------
       Google Button
  ------------------------- */
  const initGoogleLoginButton = (onSuccess) => {
    if (!window.google?.accounts?.id) return;

    window.google.accounts.id.initialize({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      callback: onSuccess,
    });

    const btn = document.getElementById("google-btn");
    if (!btn) return;
    btn.innerHTML = "";

    window.google.accounts.id.renderButton(btn, {
      type: "standard",
      theme: "outline",
      size: "large",
      width: Math.floor(btn.offsetWidth),
    });
  };

  return {
    user,
    token,
    isLoggedIn: !!token,

    login,
    signup,
    logout,
    googleLogin,

    updateProfile,
    updatePassword,
    forgotPassword,
    resetPassword,
    deleteAccount,

    // Email OTP
    sendEmailCode,
    verifyEmailCode,

    // SMS OTP
    sendSmsOtp,
    verifySmsOtp,

    // Phone verification
    sendPhoneVerificationOtp,
    verifyPhoneVerificationOtp,
    checkPhoneUnique,

    initGoogleLoginButton,
  };
};
