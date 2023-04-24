//import express from 'express';
import express from 'express';
import controller from '../controllers/person';
import auth from '../controllers/auth';
import { JoiSchema, JoiValidate } from '../middleware/person';

const router = express.Router();

router.get('/ping', controller.serverHealthCheck);

router.get('/person', auth.authenticateToken, controller.getAllPersons);
router.get('/person/:id', controller.getPersonById);
router.post('/person', JoiValidate(JoiSchema.JoiPerson), controller.createPerson);
router.put('/person/:id', controller.updatePersonById);
router.delete('/person/:id', controller.deletePersonById);

export default router;
