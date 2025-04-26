import React, { useEffect, useState, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import "./Chat.css";
import { usePlayer } from "../PlayerContext";
import socket from "./socket";

const BASE_URL = "http://localhost:5000";

const Chat = () => {
  const { playerId } = usePlayer();
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [players, setPlayers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [chatRequests, setChatRequests] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [acceptedConversations, setAcceptedConversations] = useState([]);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const messagesEndRef = useRef(null);
  const [searchParams, setSearchParams] = useSearchParams();

  // Scroll chat view to bottom
  const scrollToBottom = () =>
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

  // FETCH PLAYERS
  const fetchPlayers = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/players/${playerId}/chat`);
      if (!res.ok) throw new Error(res.statusText);
      const response=await res.json()
      setPlayers(response);
      //console.log(response);
    } catch (err) {
      console.error("Error fetching players:", err);
    }
  };

  // FETCH REQUESTS
  const fetchRequests = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/players/${playerId}/chat-requests`);
      if (!res.ok) throw new Error(res.statusText);
      const data = await res.json();
      setChatRequests(data.incoming || []);
      setPendingRequests(data.pending || []);
    } catch (err) {
      console.error("Error fetching chat requests:", err);
    }
  };

  // FETCH ACCEPTED CONVERSATIONS
  const fetchAccepted = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/players/${playerId}/conversations`);
      if (!res.ok) throw new Error(res.statusText);
      setAcceptedConversations(await res.json());
    } catch (err) {
      console.error("Error fetching conversations:", err);
    }
  };

  // FETCH GROUPS
  const fetchGroups = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/players/${playerId}/groups`);
      if (!res.ok) throw new Error(res.statusText);
      setGroups(await res.json());
    } catch (err) {
      console.error("Error fetching groups:", err);
    }
  };

  // Initial data load
  useEffect(() => {
    fetchPlayers();
    fetchRequests();
    fetchAccepted();
    fetchGroups();
  }, [playerId]);

  // Handle URL query parameters to select chat or group
  useEffect(() => {
    const receiverId = searchParams.get("receiver");
    const groupId = searchParams.get("group");

    if (receiverId) {
      const player = players.find((p) => p.playerId === Number(receiverId));
      //console.log(player);
      if (player && acceptedConversations.some((c) => c.partner_id === Number(receiverId))) {
        
        setSelected({ ...player, isGroup: false });
      }
    } else if (groupId) {
      const group = groups.find((g) => g.id === Number(groupId));
      if (group) {
        setSelected({ ...group, isGroup: true });
      }
    } else {
      setSelected(null);
    }
  }, [searchParams, players, groups, acceptedConversations]);

  // When selecting a chat or group, join socket and fetch messages
  useEffect(() => {
    if (!selected) return;
    if (selected.isGroup) {
      fetchGroupMessages(selected.id);
      socket.emit("joinGroup", selected.id);
    } else {
      fetchUserMessages(selected.playerId);
      socket.emit("join-room", `${playerId}-${selected.playerId}`);
    }
  }, [selected, playerId]);

  // Socket listeners
  useEffect(() => {
    socket.on("receiveMessage", (message) => {
      if (
        !selected?.isGroup &&
        (message.sender_id === playerId || message.receiver_id === playerId)
      ) {
        setMessages((prev) => [...prev, message]);
      }
    });
    socket.on("groupMessage", (message) => {
      if (selected?.isGroup && message.group_id === selected.id) {
        setMessages((prev) => [...prev, message]);
      }
    });
    return () => {
      socket.off("receiveMessage");
      socket.off("groupMessage");
    };
  }, [selected, playerId]);

  useEffect(scrollToBottom, [messages]);

  // FETCH messages
  const fetchUserMessages = async (receiverId) => {
    try {
      const res = await fetch(
        `${BASE_URL}/api/players/${playerId}/messages/${receiverId}`
      );
      if (!res.ok) throw new Error(res.statusText);
      setMessages(await res.json());
    } catch (err) {
      console.error("Error fetching user messages:", err);
    }
  };
  const fetchGroupMessages = async (groupId) => {
    try {
      const res = await fetch(
        `${BASE_URL}/api/players/${playerId}/groups/${groupId}/messages`
      );
      if (!res.ok) throw new Error(res.statusText);
      setMessages(await res.json());
    } catch (err) {
      console.error("Error fetching group messages:", err);
    }
  };

  // Send message
  const sendMessage = () => {
    if (!content.trim()) return;
    if (selected.isGroup) {
      socket.emit("groupMessage", {
        groupId: selected.id,
        senderId: playerId,
        content,
      });
    } else {
      socket.emit("sendMessage", {
        senderId: playerId,
        receiverId: selected.playerId,
        content,
      });
    }
    setContent("");
  };

  // Chat request actions
  const sendChatRequest = async (receiverId, e) => {
    e.stopPropagation();
    try {
      const res = await fetch(
        `${BASE_URL}/api/players/${playerId}/chat-requests`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ receiverId }),
        }
      );
      if (!res.ok) throw new Error(res.statusText);
      fetchRequests();
      alert("Chat request sent!");
    } catch (err) {
      console.error("Error sending request:", err);
    }
  };
  const acceptRequest = async (requestId) => {
    try {
      const res = await fetch(
        `${BASE_URL}/api/players/${playerId}/chat-requests/${requestId}/accept`,
        { method: "POST" }
      );
      if (!res.ok) throw new Error(res.statusText);
      fetchRequests();
      fetchAccepted();
      alert("Request accepted!");
    } catch (err) {
      console.error("Error accepting request:", err);
    }
  };

  // Group creation / deletion
  const handleGroupSubmit = async () => {
    if (!groupName.trim() || !selectedMembers.length) return;
    try {
      const res = await fetch(`${BASE_URL}/api/players/${playerId}/groups`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: groupName,
          members: [playerId, ...selectedMembers],
          creator_id: playerId,
        }),
      });
      if (!res.ok) throw new Error(res.statusText);
      setShowCreateGroup(false);
      setGroupName("");
      setSelectedMembers([]);
      fetchGroups();
      alert("Group created!");
    } catch (err) {
      console.error("Error creating group:", err);
    }
  };
  const handleDeleteGroup = async (groupId) => {
    try {
      const res = await fetch(
        `${BASE_URL}/api/players/${playerId}/groups/${groupId}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error(res.statusText);
      setGroups((prev) => prev.filter((g) => g.id !== groupId));
      if (selected?.isGroup && selected.id === groupId) {
        setSelected(null);
        setSearchParams({});
      }
      alert("Group deleted!");
    } catch (err) {
      console.error("Error deleting group:", err);
    }
  };

  // Helpers
  const hasPending = (id) => pendingRequests.some((r) => r.receiver_id === id);
  const hasIncoming = (id) => chatRequests.some((r) => r.sender_id === id);
  const hasAcceptedConv = (id) =>
    acceptedConversations.some((c) => c.partner_id === id);

  // Apply search filter to player arrays
  const filterPlayers = (list) =>
    list.filter((p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

  // Handle chat or group selection with URL update
  const selectChat = (item, isGroup) => {
    setSelected({ ...item, isGroup });
    setSearchParams(isGroup ? { group: item.id } : { receiver: item.playerId });
  };

  return (
    <div className="chat-container">
      <aside className="chat-sidebar">
        <button
          className="create-group-btn"
          onClick={() => setShowCreateGroup(true)}
        >
          + Create Group
        </button>

        {/* Search box */}
        <input
          className="player-search"
          type="text"
          placeholder="Search players…"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        {showCreateGroup && (
          <div className="create-group-modal">
            <h4>Create Group</h4>
            <input
              type="text"
              placeholder="Group Name"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
            />
            <div className="member-list">
              {filterPlayers(players)
                .filter((p) => p.playerId !== playerId)
                .map((p) => (
                  <label key={p.playerId}>
                    <input
                      type="checkbox"
                      value={p.playerId}
                      checked={selectedMembers.includes(p.playerId)}
                      onChange={(e) =>
                        setSelectedMembers((prev) =>
                          e.target.checked
                            ? [...prev, p.playerId]
                            : prev.filter((id) => id !== p.playerId)
                        )
                      }
                    />
                    {p.name}
                  </label>
                ))}
            </div>
            <div className="modal-actions">
              <button onClick={handleGroupSubmit}>Create</button>
              <button onClick={() => setShowCreateGroup(false)}>
                Cancel
              </button>
            </div>
          </div>
        )}

        <Section
          title="Pending"
          items={pendingRequests.map((r) => ({
            key: r.id,
            label: `To ${r.receiver_name} (… )`,
            disabled: true,
          }))}
        />

        <Section
          title="Incoming"
          items={chatRequests.map((r) => ({
            key: r.id,
            label: `From ${r.sender_name}`,
            action: () => acceptRequest(r.id),
            actionLabel: "Accept",
          }))}
        />

        <Section
          title="Accepted"
          items={filterPlayers(players)
            .filter((p) => hasAcceptedConv(p.playerId))
            .map((p) => ({
              key: p.playerId,
              label: p.name,
              action: () => selectChat(p, false),
              isSelected: selected && !selected.isGroup && selected.playerId === p.playerId,
            }))}
        />

        <Section
          title="Other"
          items={filterPlayers(players)
            .filter(
              (p) =>
                !hasAcceptedConv(p.playerId) &&
                !hasPending(p.playerId) &&
                !hasIncoming(p.playerId)
            )
            .map((p) => ({
              key: p.playerId,
              label: p.name,
              action: (e) => sendChatRequest(p.playerId, e),
              actionLabel: "Send",
            }))}
        />

        <Section
          title="Groups"
          items={groups.map((g) => ({
            key: g.id,
            label: g.name,
            action: () => selectChat(g, true),
            actionLabel: g.creator_id === playerId ? "Del" : null,
            actionSecondary:
              g.creator_id === playerId
                ? () => handleDeleteGroup(g.id)
                : null,
            isSelected: selected && selected.isGroup && selected.id === g.id,
          }))}
        />
      </aside>

      <main className="chat-main">
        {selected ? (
          <>
            <header className="chat-header">
              {selected.isGroup ? `Group: ${selected.name}` : selected.name}
            </header>
            <section className="chat-messages">
              {messages.map((msg) => (
                <div
                  key={msg.id || Math.random()}
                  className={`chat-message ${
                    msg.sender_id === playerId ? "sent" : "received"
                  }`}
                >
                  <span className="message-sender">
                    {msg.sender_id === playerId ? "You" : msg.sender_name}
                  </span>
                  <p>{msg.content}</p>
                  <div className="timestamp">
                    {new Date(msg.timestamp).toLocaleString("en-IN", {
                      timeZone: "Asia/Kolkata",
                      year: "numeric",
                      month: "short",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                      hour12: false,
                    })}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </section>
            <div className="chat-input">
              <input
                type="text"
                value={content}
                placeholder="Type a message…"
                onChange={(e) => setContent(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              />
              <button onClick={sendMessage}>Send</button>
            </div>
          </>
        ) : (
          <div className="chat-placeholder">
            Select a player or group to start chatting
          </div>
        )}
      </main>
    </div>
  );
};

const Section = ({ title, items }) => (
  <div className="chat-section">
    <h3 className="section-title">{title}</h3>
    {items.length === 0 ? (
      <div className="empty-text">— none —</div>
    ) : (
      items.map((it) => (
        <div
          key={it.key}
          className={`chat-item ${it.disabled ? "disabled" : ""} ${it.isSelected ? "selected" : ""}`}
          onClick={(e) => it.action && it.action(e)}
        >
          <span>{it.label}</span>
          {it.actionLabel && (
            <button
              className="item-btn"
              onClick={(e) => {
                e.stopPropagation();
                it.action(e);
              }}
            >
              {it.actionLabel}
            </button>
          )}
        </div>
      ))
    )}
  </div>
);

export default Chat;