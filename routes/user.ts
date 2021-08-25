import express from 'express';
const router = express.Router();

import usersController from '../controllers/user';
import isAuth from '../middleware/isAuth';
import isAdmin from '../middleware/isAdmin';

/*** Endpoints ***/
router.post('/', isAuth, isAdmin, usersController.postUser);

export default router;
