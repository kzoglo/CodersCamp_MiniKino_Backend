import express from 'express';
const router = express.Router();

import isAuth from '../middleware/isAuth';
import isAdmin from '../middleware/isAdmin';
import moviesController from '../controllers/movie';

/*** Endpoints ***/
router.get('/', moviesController.getMovies);
router.get('/:id', moviesController.getMovie);
router.post('/', isAuth, isAdmin, moviesController.postMovie);

export default router;
