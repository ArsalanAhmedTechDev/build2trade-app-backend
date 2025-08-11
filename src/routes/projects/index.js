var express = require("express");
var router = express.Router();
const { check } = require("express-validator");

// required controllers
const ProjectController = require("../../controllers/Projects/ProjectController");

//middlewares
const Authenticate = require("../../middlewares/authenticate");

// helper functions
const { validateInput } = require("../../helpers/validate");

/** FMR Routes **/
router.get("/getById/:projectId", Authenticate, ProjectController.getById);
router.post("/create", Authenticate, ProjectController.create);
router.post("/update", Authenticate, ProjectController.update);
router.get("/get", Authenticate, ProjectController.getAll);

module.exports = router;

