import express from 'express';
import controller from '../controllers/user.js';
import auth from '../controllers/auth.js';
import { JoiValidate, JoiSchemas } from '../middleware/joi.js';

const router = express.Router();

router.get('/user', auth.authenticateToken, controller.getAll);
router.get('/user/:id', auth.authenticateToken, controller.getById);
router.post('/user', auth.authenticateToken, JoiValidate(JoiSchemas.user), controller.create);
router.put('/user/:id', auth.authenticateToken, JoiValidate(JoiSchemas.user), controller.updateById);
router.delete('/user/:id', auth.authenticateToken, controller.deleteById);

export default router;
