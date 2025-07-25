var express = require("express");
var router = express.Router();
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() }); // no file saving

// required controllers
const ComplaintController = require("../../controllers/Complaints/ComplaintsController");

//middlewares
const Authenticate = require("../../middlewares/authenticate");

/** Complaint Routes **/
router.get("/getAll", Authenticate, ComplaintController.getAll);
router.post(
  "/create",
  Authenticate,
  //   upload.array("files"), // expecting multiple files from field named files[]
  upload.any(), // accepts any file on any field

  ComplaintController.create
);
module.exports = router;
