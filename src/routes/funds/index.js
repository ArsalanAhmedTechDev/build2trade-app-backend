var express = require('express');
var router = express.Router();
const { check } = require('express-validator')

// required controllers
const DailyFundPricesController = require('../../controllers/Funds/DailyFundPricesController')

//middlewares
const Authenticate = require('../../middlewares/authenticate')

// helper functions
const {validateInput} = require('../../helpers/validate')


/** Routes **/
router.get('/getAll',Authenticate, DailyFundPricesController.getAll)
router.get('/getArchive',Authenticate, DailyFundPricesController.getArchive)
router.get('/history/:fundId?',Authenticate, DailyFundPricesController.getHistory)
router.get('/unitPrices',Authenticate, DailyFundPricesController.getUnitPrices)

module.exports = router;
