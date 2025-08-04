var express = require("express");
var router = express.Router();
const { check } = require("express-validator");

// required controllers
const SubscriptionController = require("../../controllers/Subscriptions/SubscriptionsController");

//middlewares
const Authenticate = require("../../middlewares/authenticate");

// helper functions
const { validateInput } = require("../../helpers/validate");

/** FMR Routes **/
// router.get("/getById/:subscriptionId", Authenticate, SubscriptionController.getById);
router.get("/get", Authenticate, SubscriptionController.getAll);
// router.post("/create", Authenticate, SubscriptionController.create);
// router.post("/update", Authenticate, SubscriptionController.update);

module.exports = router;

