var express = require('express');
var router = express.Router();
const { check } = require('express-validator')

// required controllers
const ProductController = require('../../controllers/Product/ProductController')

//middlewares
const Authenticate = require('../../middlewares/authenticate')

// helper functions
const {validateInput} = require('../../helpers/validate')


/** Product Routes **/
router.get('/getById/:productId',Authenticate, ProductController.getById)
router.get('/get/:parentId?',Authenticate, ProductController.getAll)

module.exports = router;
