const express = require('express');
const router = express.Router();

const isAuth = require('../middleware/isAuth');
const isAdmin = require('../middleware/isAdmin');
const moviesController = require('../controllers/movie');

/*** Endpoints ***/
router.get('/', moviesController.getMovies);
router.get('/:id', moviesController.getMovie);
router.post('/', isAuth, isAdmin, moviesController.postMovie);

module.exports = router;
