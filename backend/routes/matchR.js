import express from 'express';
// import { requiresAuth } from 'express-openid-connect'; // Middleware for Auth0 authentication
import { getAllMatches, getMatchById, insertMatch ,updateMatch,updateMatchPlayingSquad,getMatchPlayingSquad} from '../controller/matchC.js';


const router = express.Router();


router.get('/',getAllMatches);
router.post('/', insertMatch);
router.get('/:matchId', getMatchById);
router.patch('/:matchId', updateMatch);//patch to update specific fields
router.post('/:matchId/playingSquad', updateMatchPlayingSquad);
router.get('/:matchId/playingSquad', getMatchPlayingSquad);



// Route to insert a new match (protected)

// Route to get a match by ID

export default router;
