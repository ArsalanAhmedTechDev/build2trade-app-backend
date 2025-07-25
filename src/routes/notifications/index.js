var express = require("express");
var router = express.Router();
const { check } = require("express-validator");

// required controllers
const defaultController = require("../../controllers/Notification/NotificationController");

//middlewares
const Authenticate = require("../../middlewares/authenticate");

// helper functions
const { validateInput } = require("../../helpers/validate");

/** Routes **/
router.get("/getAll", Authenticate, defaultController.getAll);
router.post(
  "/markReadNotification",
  Authenticate,
  defaultController.markReadNotification
);
// router.get("/getAllOld", Authenticate, defaultController.getAllOld);

module.exports = router;
