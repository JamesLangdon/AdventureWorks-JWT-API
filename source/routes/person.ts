import express from 'express';
import controller from '../controllers/person.js';
import auth from '../controllers/auth.js';
import { JoiValidate, JoiSchemas } from '../middleware/joi.js';

const router = express.Router();

router.get('/ping', controller.serverHealthCheck);

router.get('/person', auth.authenticateToken, controller.getAllPersons);
router.get('/person/:id', controller.getPersonById);
router.post('/person', JoiValidate(JoiSchemas.person), controller.createPerson);
router.put('/person/:id', controller.updatePersonById);
router.delete('/person/:id', controller.deletePersonById);

export default router;
