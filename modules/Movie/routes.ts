import express from 'express';
const router = express.Router();

// import isAuth from '../../../middleware/isAuth';
// import isAdmin from '../../../middleware/isAdmin';
import { ControllerMovieFactory as controller } from './ControllerMovie';
import { validatorMovieFactory as validatorMovie } from './valid'; 

/*** Endpoints ***/
router.get('/', controller().getMovies);
router.get('/:id', validatorMovie().generic.getMovie, controller().getMovie);
router.post('/', validatorMovie().generic.postMovie, controller().postMovie);

export default router;
