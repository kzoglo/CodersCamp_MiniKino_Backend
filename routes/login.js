const express = require('express');
const router = express.Router();

const loginController = require('../controllers/login');

/*** Endpoints ***/
router.post('/', loginController.login);

module.exports = router;
