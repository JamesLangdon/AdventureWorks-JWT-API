import express from 'express';
import controller from '../controllers/user.js';
import auth from '../controllers/auth.js';
import { JoiValidate, JoiSchemas } from '../middleware/joi.js';

const router = express.Router();

router.get('/person', auth.authenticateToken, controller.getAll);
router.get('/person/:id', controller.getById);
router.post('/person', JoiValidate(JoiSchemas.user), controller.create);
router.put('/person/:id', controller.updateById);
router.delete('/person/:id', controller.deleteById);

export default router;
