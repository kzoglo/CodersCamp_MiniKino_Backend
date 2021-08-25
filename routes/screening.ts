import express from 'express';
const router = express.Router();

import areParamsObjectIds from '../middleware/areParamsObjectIds';
import isAuth from '../middleware/isAuth';
import isAdmin from '../middleware/isAdmin';
import screeningController from '../controllers/screening';

/*** Endpoints ***/
router.get('/', screeningController.getScreenings);
router.get(
  '/:movie_id/:screening_id',
  isAuth,
  areParamsObjectIds,
  screeningController.getScreening
);
router.post('/', isAuth, isAdmin, screeningController.postScreening);

export default router;
