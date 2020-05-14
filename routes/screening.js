const express = require('express');
const router = express.Router();

const areParamsObjectIds = require('../middleware/areParamsObjectIds');
const isAuth = require('../middleware/isAuth');
const isAdmin = require('../middleware/isAdmin');
const screeningController = require('../controllers/screening');

/*** Endpoints ***/
router.get('/', screeningController.getScreenings);
router.get(
  '/:movie_id/:screening_id',
  isAuth,
  areParamsObjectIds,
  screeningController.getScreening
);
router.post('/', isAuth, isAdmin, screeningController.postScreening);

module.exports = router;
