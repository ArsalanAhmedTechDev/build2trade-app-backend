var express = require("express");
var router = express.Router();
const { check } = require("express-validator");

// required controllers
const BookCallController = require("../../controllers/BookCall/BookCallController");

//middlewares
const Authenticate = require("../../middlewares/authenticate");

// helper functions
const { validateInput } = require("../../helpers/validate");

/** Routes **/
router.post("/bookcall", Authenticate, BookCallController.createBookCall);

module.exports = router;
