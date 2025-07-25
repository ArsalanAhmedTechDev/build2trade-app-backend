var express = require('express');
var router = express.Router();
const { check } = require('express-validator')

// required controllers
const defaultController = require('../../controllers/TeamMembers/TeamMemberController')

//middlewares
const Authenticate = require('../../middlewares/authenticate')

// helper functions
const {validateInput} = require('../../helpers/validate')


/** Forms Routes **/
router.get('/getById/:id',Authenticate, defaultController.getById)
router.get('/get', defaultController.getAll)

module.exports = router;
