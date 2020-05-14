const express = require('express');
const router = express.Router();

const isAuth = require('../middleware/isAuth');
const isAdmin = require('../middleware/isAdmin');
const roomController = require('../controllers/room');

/*** Endpoints ***/
router.post('/', isAuth, isAdmin, roomController.postRoom);

module.exports = router;
