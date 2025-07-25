var express = require("express");
var router = express.Router();

// required controllers
const ServiceRequestController = require("../../controllers/ServiceRequest/ServiceRequestController");

//middlewares
const Authenticate = require("../../middlewares/authenticate");

/** Service Request Routes **/
router.get(
  "/getById/:serviceRequestId",
  Authenticate,
  ServiceRequestController.getById
);
router.get("/get", Authenticate, ServiceRequestController.getAll);
router.post("/create", Authenticate, ServiceRequestController.create);

module.exports = router;
