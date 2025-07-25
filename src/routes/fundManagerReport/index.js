var express = require('express');
var router = express.Router();
const { check } = require('express-validator')

// required controllers
const FundManagerReportController = require('../../controllers/FundManagerReport/FundManagerReportsController')

//middlewares
const Authenticate = require('../../middlewares/authenticate')

// helper functions
const {validateInput} = require('../../helpers/validate')


/** Product Routes **/
router.get('/getById/:fmrId',Authenticate, FundManagerReportController.getById)
router.get('/get',Authenticate, FundManagerReportController.getAll)

module.exports = router;
