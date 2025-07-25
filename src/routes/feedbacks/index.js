var express = require("express");
var router = express.Router();
const { check } = require("express-validator");

// required controllers
const FeedbacksController = require("../../controllers/Feedbacks/FeedbacksController");

//middlewares
const Authenticate = require("../../middlewares/authenticate");

/** Routes **/
router.post(
  "/feedbackCreate",
  Authenticate,
  FeedbacksController.createFeedback
);
router.get(
  "/getCustomerFeedback",
  Authenticate,
  FeedbacksController.getFeedbackByUserId
);

module.exports = router;
