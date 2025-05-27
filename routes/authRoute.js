const router = require("express").Router();

const {
  register,
  login,
  logout,
  refreshAccessToken,
  requestResetCode,
  verifyResetCode,
  resetPassword,
} = require("../controllers/authController");

const {
  registerValidator,
  loginValidator,
  refreshAccessTokenValidator,
  requestResetCodeValidator,
  verifyResetCodeValidator,
  resetPasswordValidator,
} = require("../validators/authValidator");

router.post("/register", registerValidator, register);
router.post("/login", loginValidator, login);
router.post("/logout", logout);
router.post("/refresh-access-token", refreshAccessTokenValidator, refreshAccessToken);
router.post("/request-reset-code", requestResetCodeValidator, requestResetCode);
router.post("/verify-reset-code", verifyResetCodeValidator, verifyResetCode);
router.post("/reset-password", resetPasswordValidator, resetPassword);

module.exports = router;
