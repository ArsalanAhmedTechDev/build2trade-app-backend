var express = require("express");
var router = express.Router();
const { check } = require("express-validator");

// required controllers
const FaqsController = require("../../controllers/Faqs/FaqsController");

//middlewares
const Authenticate = require("../../middlewares/authenticate");

/** Routes **/
router.get("/getAllFaqs", Authenticate, FaqsController.getAll);

module.exports = router;
