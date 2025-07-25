var express = require('express');
var router = express.Router();
const { check } = require('express-validator')

// required controllers
const FormController = require('../../controllers/Form/FormController')

//middlewares
const Authenticate = require('../../middlewares/authenticate')

// helper functions
const {validateInput} = require('../../helpers/validate')


/** Forms Routes **/
router.get('/getById/:formId',Authenticate, FormController.getById)
router.get('/get',Authenticate, FormController.getAll)

module.exports = router;
