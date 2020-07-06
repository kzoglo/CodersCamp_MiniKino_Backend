const express = require('express');
const router = express.Router();

const usersController = require('../controllers/user');
const isAuth = require('../middleware/isAuth');
const isAdmin = require('../middleware/isAdmin');

/*** Endpoints ***/
router.post('/', isAuth, isAdmin, usersController.postUser);

module.exports = router;
