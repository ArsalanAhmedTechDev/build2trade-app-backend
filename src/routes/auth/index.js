var express = require("express");
var router = express.Router();
const { check } = require("express-validator");

// required controllers
const authController = require("../../controllers/Auth/AuthController");

//middlewares
const Authenticate = require("../../middlewares/authenticate");

// helper functions
const { validateInput } = require("../../helpers/validate");

/** Authentication Routes **/
// router.post("/login-check", authController.loginCheck);
router.post("/login", authController.login);
router.post("/signup", authController.signup);
// router.post("/set-password", authController.updatePin);
router.post("/logout", authController.logout);
// router.post("/customer-exist", authController.customerExist);

// router.get("/checkAuth", Authenticate, authController.checkAuth);

module.exports = router;
