const express = require('express');
const router = express.Router();

const seatsController = require('../controllers/seat');
const isAuth = require('../middleware/isAuth');
const isAdmin = require('../middleware/isAdmin');

/*** Endpoints ***/
router.get('/', isAuth, seatsController.getSeats);
router.get('/:room_id', isAuth, seatsController.getRoomSeats);
router.get('/:room_id/:row/:seatNumber', isAuth, seatsController.getSeat);
router.post('/', isAuth, isAdmin, seatsController.postSeat);

module.exports = router;
