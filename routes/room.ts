import express from 'express';
const router = express.Router();

import isAuth from '../middleware/isAuth';
import isAdmin from '../middleware/isAdmin';
import roomController from '../controllers/room';

/*** Endpoints ***/
router.post('/', isAuth, isAdmin, roomController.postRoom);

export default router;
