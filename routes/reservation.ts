import express from 'express';
const router = express.Router();

import areParamsObjectIds from '../middleware/areParamsObjectIds';
import isAuth from '../middleware/isAuth';
import reservationController from '../controllers/reservation';

/*** Endpoints ***/
router.get(
  '/:user_id/:screening_id',
  isAuth,
  areParamsObjectIds,
  reservationController.getReservations
);
router.post('/', isAuth, reservationController.postReservation);

export default router;
