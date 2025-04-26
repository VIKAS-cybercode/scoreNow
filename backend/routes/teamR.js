import express from 'express';
import { getTeamById, insertTeam,getAllTeams } from '../controller/teamC.js';
import {joinTeam} from '../models/teamRPlayer.js';

const router = express.Router();

router.post('/', insertTeam);
// router.get('/',getAllTeams);
router.get('/',getAllTeams);
router.get('/:teamId',getTeamById);
router.post('/:teamId',joinTeam)



export default router;