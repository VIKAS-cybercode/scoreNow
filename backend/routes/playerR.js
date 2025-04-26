import express from 'express'
import { getMyMatches, getMyTeams, getMyTournaments, getOrganisedMatches, 
    getOrganisedTournaments, getPlayerProfile,getPlayerProfileById, insertPlayer,
    getAllPlayersExceptCurrent  } from '../controller/playerC.js'
import { insertTeam } from '../controller/teamC.js'
import {createChatRequest,getChatRequests,acceptChatRequest,getConversations,getMessages,sendMessage,createGroup,getGroups,getGroupMessages,createGroupJoinRequest,getGroupJoinRequests,acceptGroupJoinRequest, deleteGroup} from '../controller/chatC.js';
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
router.post('/:playerId/teams', insertTeam)
router.get("/:playerId/chat", getAllPlayersExceptCurrent );

// --- CHAT ROUTES ---
// One-to-One Chat Requests
router.post('/:playerId/chat-requests', createChatRequest);
router.get('/:playerId/chat-requests', getChatRequests);
router.post('/:playerId/chat-requests/:id/accept', acceptChatRequest);

// Conversations
router.get('/:playerId/conversations', getConversations);

// One-to-One Messages
router.get('/:playerId/messages/:receiverId', getMessages);
router.post('/:playerId/messages/:receiverId', sendMessage);

// Groups
router.post('/:playerId/groups', createGroup);
router.get('/:playerId/groups', getGroups);

// Group Messages
router.get('/:playerId/groups/:groupId/messages', getGroupMessages);

// Group Join Requests
router.post('/:playerId/group-join-requests', createGroupJoinRequest);
router.get('/:playerId/group-join-requests', getGroupJoinRequests);
router.post('/:playerId/group-join-requests/:id/accept', acceptGroupJoinRequest);

router.delete("/:playerId/groups/:groupId",deleteGroup);


export default router;
