var express = require('express');
var router = express.Router();

// required controllers
const otpController = require("../../controllers/OTP/OTPController");


// helper functions
const {validateInput} = require('../../helpers/validate')


/** OTP Routes **/
router.post('/generate', otpController.generateOtp)
router.post('/verify', otpController.verifyOtp)

module.exports = router;
