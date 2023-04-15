import express, { Request, Response } from 'express';
import controller from '../controllers/person';

const router = express.Router();

router.get('/ping', controller.serverHealthCheck);
router.get('/p', controller.getAllPersons);
router.get('/persons/:id', controller.getPersonById);

router.post('/persons', controller.createPerson);
router.put('/persons/:id', controller.updatePersonById);
router.delete('/persons/:id', controller.deletePersonById);

export default router;
