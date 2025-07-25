var express = require("express");
var router = express.Router();
const { check } = require("express-validator");

// required controllers
const ConfigurationsController = require("../../controllers/Configurations/ConfigurationsController");

//middlewares
const Authenticate = require("../../middlewares/authenticate");

/** Routes **/
router.get(
  "/getAllListings",
  Authenticate,
  ConfigurationsController.getAllListings
);

router.get(
  "/getAllConfigurations",
  Authenticate,
  ConfigurationsController.getAllConfigurations
);

module.exports = router;
