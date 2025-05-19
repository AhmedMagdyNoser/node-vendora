const router = require("express").Router();

const { register, login, requestResetCode, verifyResetCode, resetPassword } = require("../services/authService");

const {
  registerValidator,
  loginValidator,
  requestResetCodeValidator,
  verifyResetCodeValidator,
  resetPasswordValidator,
} = require("../validators/authValidator");

router.post("/register", registerValidator, register);
router.post("/login", loginValidator, login);
router.post("/request-reset-code", requestResetCodeValidator, requestResetCode);
router.post("/verify-reset-code", verifyResetCodeValidator, verifyResetCode);
router.post("/reset-password", resetPasswordValidator, resetPassword);

module.exports = router;
