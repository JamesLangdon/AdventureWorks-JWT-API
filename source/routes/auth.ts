import express, { Request, Response } from 'express';
import controller from '../controllers/auth';

const router = express.Router();

router.get('/login', controller.authenticate);

export default router;
