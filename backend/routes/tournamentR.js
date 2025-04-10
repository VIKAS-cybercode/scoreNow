import express from 'express';
import { getAllTournaments, insertTournament, getTournamentMatches,getTournamentStats,getTournamentTeams} from '../controller/tournamentC.js';
// export {insertTournament,getAllTournaments,getTournamentMatches,getTournamentTeams,getTournamentStats}

const router = express.Router();

router.post('/', insertTournament);
router.get('/',getAllTournaments);
router.get('/:tournamentId/matches',getTournamentMatches);
// // router.get('/:tournamentId/leaderBoard',getTournamentLeaderBoard);//left
router.get('/:tournamentId/stats',getTournamentStats);
router.get('/:tournamentId/teams',getTournamentTeams);
// router.get('/:tournamentId/pointsTable',getTournamentpointsTable);//left


export default router;
