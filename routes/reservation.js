const express = require('express');
const router = express.Router();

const areParamsObjectIds = require('../middleware/areParamsObjectIds');
const isAuth = require('../middleware/isAuth');
const reservationController = require('../controllers/reservation');

/*** Endpoints ***/
router.get(
  '/:user_id/:screening_id',
  isAuth,
  areParamsObjectIds,
  reservationController.getReservations
);
router.post('/', isAuth, reservationController.postReservation);

module.exports = router;
