import express from 'express';
const router = express.Router();

import seatsController from '../controllers/seat';
import isAuth from '../middleware/isAuth';
import isAdmin from '../middleware/isAdmin';

/*** Endpoints ***/
router.get('/', isAuth, seatsController.getSeats);
router.get('/:room_id', isAuth, seatsController.getRoomSeats);
router.get('/:room_id/:row/:seatNumber', isAuth, seatsController.getSeat);
router.post('/', isAuth, isAdmin, seatsController.postSeat);

export default router;
