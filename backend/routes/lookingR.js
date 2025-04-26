// backend/routes/lookingRoutes.js
import express from 'express';
import {
  getAllLookings,
  createLooking
} from '../controller/lookingC.js';

const router = express.Router();

router.get('/', getAllLookings);
router.post('/', createLooking);

export default router;
