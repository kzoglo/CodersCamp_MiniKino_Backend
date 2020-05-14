const express = require('express');
const router = express.Router();

const usersController = require('../controllers/user');
const createAdminAccount = require('../middleware/createAdminAccount');

/*** Endpoints ***/
router.post('/', createAdminAccount, usersController.postUser);

module.exports = router;
