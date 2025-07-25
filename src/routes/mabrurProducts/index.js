var express = require("express");
var router = express.Router();
const { check } = require("express-validator");

// required controllers
const ProductController = require("../../controllers/MabrurProduct/MabrurProductController");

//middlewares
const Authenticate = require("../../middlewares/authenticate");

// helper functions
const { validateInput } = require("../../helpers/validate");

/** Routes **/
router.get("/get", Authenticate, ProductController.getAll);
router.get(
  "/getDetails/:productId",
  Authenticate,
  ProductController.getDetails
);
router.get("/getPlan", Authenticate, ProductController.getPlan);
router.get("/getPlanTest", Authenticate, ProductController.getPlanTest);

module.exports = router;
