import express from 'express';
const router = express.Router();

import loginController from '../controllers/login';

/*** Endpoints ***/
router.post('/', loginController.login);

export default router;
