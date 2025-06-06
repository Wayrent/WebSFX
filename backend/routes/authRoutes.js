const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  requestPasswordReset,
  verifyResetCode,
  resetPassword,
  verifyEmail, // ← добавь это
  verifyRegistrationCode,
  resendVerificationCode
} = require('../controllers/authController');


router.post('/verify-registration', verifyRegistrationCode);
router.get('/verify-email', verifyEmail);
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/request-reset', requestPasswordReset);
router.post('/verify-reset', verifyResetCode);
router.post('/reset-password', resetPassword);
router.post('/resend-code', resendVerificationCode);

module.exports = router;