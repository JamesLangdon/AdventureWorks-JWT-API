import express from 'express';
import controller from '../controllers/user.js';
import auth from '../controllers/auth.js';
import { JoiValidate, JoiSchemas } from '../middleware/joi.js';

const router = express.Router();

router.get('/user', auth.authenticateToken, controller.getAll);
router.get('/user/:id', controller.getById);
router.post('/user', JoiValidate(JoiSchemas.user), controller.create);
router.put('/user/:id', JoiValidate(JoiSchemas.user), controller.updateById);
router.delete('/user/:id', controller.deleteById);

export default router;
