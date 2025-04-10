import express from 'express';
import { getTeamById, insertTeam,getAllTeams } from '../controller/teamC.js';

const router = express.Router();

router.post('/', insertTeam);
// router.get('/',getAllTeams);
router.get('/all',getAllTeams);
router.get('/:teamId',getTeamById);


export default router;
