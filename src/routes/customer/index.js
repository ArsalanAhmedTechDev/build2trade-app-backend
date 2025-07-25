var express = require("express");
var router = express.Router();
const { check } = require("express-validator");

// required controllers
const CustomerController = require("../../controllers/Customer/CustomerController");

//middlewares
const Authenticate = require("../../middlewares/authenticate");

// helper functions
const { validateInput } = require("../../helpers/validate");

/** Routes **/
router.post("/updateProfile", Authenticate, CustomerController.updateProfile);
router.post(
  "/updatePhoneNumber",
  Authenticate,
  CustomerController.updatePhoneNumber
);
router.post("/updateAccountStatus", CustomerController.updateAccountStatus); //add authenticate middleware
router.get("/getPolicy", Authenticate, CustomerController.getPolicy);
// router.get("/getPolicyTest", Authenticate, CustomerController.getPolicyTest);
router.post("/getPmdDocs", Authenticate, CustomerController.getPmdDocsForUS);
router.post(
  "/getPmdDocumentDownload",
  Authenticate,
  CustomerController.getPmdDocumentDownloadForUS
);
router.get("/dashboard", Authenticate, CustomerController.dashboard);
router.post("/getById", Authenticate, CustomerController.getById);
router.get(
  "/getMemberShipPdf",
  Authenticate,
  CustomerController.getMemberShipPdf
);

module.exports = router;
