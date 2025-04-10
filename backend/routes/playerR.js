import express from 'express'
import { getMyMatches, getMyTeams, getMyTournaments, getOrganisedMatches, 
    getOrganisedTournaments, getPlayerProfile,getPlayerProfileById, insertPlayer } from '../controller/playerC.js'
import { insertTeam } from '../controller/teamC.js'

const router = express.Router()

//  /api/player
router.post('/', insertPlayer) // no form
router.get('/:auth0Id', getPlayerProfile)
router.get("/id/:playerId", getPlayerProfileById); 
router.get('/:playerId/matches', getMyMatches)
router.get('/:playerId/organisedMatches', getOrganisedMatches) 
router.get('/:playerId/teams', getMyTeams)
router.get('/:playerId/tournaments', getMyTournaments)
router.get('/:playerId/organisedTournaments', getOrganisedTournaments) 
// router.get('/:playerId/matches/:matchId', getMyMatchById)
// router.get('/:playerId/organisedMatches/:matchId', getOrganisedMatchById)

router.post('/:playerId/teams', insertTeam)
export default router;
