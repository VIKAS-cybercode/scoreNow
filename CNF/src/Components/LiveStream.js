import "./LiveStream.css";
import React, { useEffect, useRef, useState } from "react";
import {
  MeetingProvider,
  useMeeting,
  useParticipant,
  Constants,
} from "@videosdk.live/react-sdk";
import { authToken, createStream } from "./API";

function JoinView({ initializeStream, isOrganiser }) {
  const activeStreamId = localStorage.getItem("activeStreamId");

  const handleAction = async (mode) => {
    await initializeStream("", mode);
  };

  return (
    <div className="video-container">
      {/* Only organiser sees this if there's no active stream */}
      {isOrganiser && !activeStreamId && (
        <button onClick={() => handleAction(Constants.modes.SEND_AND_RECV)}>
          Create Live Stream as Host
        </button>
      )}

      {/* All users can join if a stream is active */}
      {activeStreamId ? (
        <button onClick={() => handleAction(Constants.modes.RECV_ONLY)}>
          Join as Audience
        </button>
      ) : (
        // Only show this message to non-organisers
        !isOrganiser && <p>No active livestreams</p>
      )}
    </div>
  );
}


function LSContainer({ streamId, onLeave }) {
  const [joined, setJoined] = useState(false);
  const { join } = useMeeting({
    onMeetingJoined: () => setJoined(true),
    onMeetingLeft: onLeave,
    onError: (error) => alert(error.message),
  });

  return (
    <div className="container">
      <h3>Stream Id: {streamId}</h3>
      {joined ? <StreamView /> : <button onClick={join}>Join Stream</button>}
    </div>
  );
}

function StreamView() {
  const { participants } = useMeeting();
  const [isFullScreen, setIsFullScreen] = useState(false);
  const fullScreenRef = useRef(null);
  const uniqueParticipants = [...new Map(participants.values().map(p => [p.id, p])).values()];
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY < 50 && isFullScreen) {
        setIsFullScreen(false);
        document.exitFullscreen();
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isFullScreen]);
  useEffect(() => {
    const handleFullScreenChange = () => {
      if (!document.fullscreenElement) {
        setIsFullScreen(false);
      }
    };
  
    document.addEventListener("fullscreenchange", handleFullScreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullScreenChange);
  }, []);
  

  const toggleFullScreen = () => {
    if (!isFullScreen) {
      if (fullScreenRef.current) {
        fullScreenRef.current.requestFullscreen();
        fullScreenRef.current.style.width = "80vw";
        fullScreenRef.current.style.height = "80vh";
        setIsFullScreen(true);
      }
    } else {
      if (document.fullscreenElement) {
        document.exitFullscreen();
        fullScreenRef.current.style.width = "";
        fullScreenRef.current.style.height = "";
        setIsFullScreen(false);
      }
    }
  };

  function MatchScore() {
    return (
      <div className="match-score">
        <span className="team-name">IND</span>
        <span className="score">150/3</span>
        <span className="overs">Overs: 15.2/20</span>
        <span className="target">Target: 180</span>
        <span className="run-rate">RR: 8.3</span>
  
        <span className="batsman">Virat Kohli* 55(38)</span>
        <span className="batsman">Rohit Sharma 45(28)</span>
  
        <span className="over-label">This Over:</span>
        <div className="balls">
          <span className="ball">1</span>
          <span className="ball">4</span>
          <span className="ball wicket">W</span>
          <span className="ball">6</span>
          <span className="ball">2</span>
          <span className="ball">1</span>
        </div>
      </div>
    );
  }
  
  
  

  return (
    <div ref={fullScreenRef} className={`stream-view ${isFullScreen ? "fullscreen" : ""}`}>
      
      <LSControls toggleFullScreen={toggleFullScreen} isFullScreen={isFullScreen} />
      

      {uniqueParticipants
  .filter((p) => p.mode === Constants.modes.SEND_AND_RECV)
  .map((p) => (
    <Participant participantId={p.id} key={p.id} isFullScreen={isFullScreen} />
  ))}

      {isFullScreen && <MatchScore />}
    </div>
  );
}

function Participant({ participantId,isFullScreen }) {
  const { webcamStream, micStream, webcamOn, micOn, isLocal, displayName } =
    useParticipant(participantId);
  const audioRef = useRef(null);
  const videoRef = useRef(null);

  const setupStream = (stream, ref, condition) => {
    if (ref.current && stream) {
      ref.current.srcObject = condition ? new MediaStream([stream.track]) : null;
      condition && ref.current.play().catch(console.error);
    }
  };

  useEffect(() => setupStream(micStream, audioRef, micOn), [micStream, micOn]);
  useEffect(() => setupStream(webcamStream, videoRef, webcamOn), [
    webcamStream,
    webcamOn,
  ]);

  return (
    <div className="participant">
      <p>
        {displayName} | Webcam: {webcamOn ? "ON" : "OFF"} | Mic: {micOn ? "ON" : "OFF"}
      </p>
      <audio ref={audioRef} autoPlay muted={isLocal} />
      {webcamOn && (
        <video ref={videoRef} autoPlay muted={isLocal} className="participant-video" style={{ marginBottom:"3px" ,height: isFullScreen ? "80vh" : "150px" }} />
      )}
    </div>
  );
}

function LSControls({toggleFullScreen ,isFullScreen}) {
  const { leave } = useMeeting();
  return (
    <div className="controls">
      <button onClick={leave}>Leave</button>
      <button onClick={toggleFullScreen} className="fullscreen-btn">
        {isFullScreen ? "Go Minimize" : "Go Full Screen"}
      </button>
    </div>
  );
}

function LiveStream( {isOrganiser}) {
  const [streamId, setStreamId] = useState(null);
  const [mode, setMode] = useState(Constants.modes.SEND_AND_RECV);
  const isHostUser = true;

  const initializeStream = async (id, userMode) => {
    let newStreamId;
    if (userMode === Constants.modes.SEND_AND_RECV) {
      if (!id) {
        newStreamId = await createStream({ token: authToken });
        localStorage.setItem("activeStreamId", newStreamId);
      } else {
        newStreamId = id;
      }
    } else if (userMode === Constants.modes.RECV_ONLY) {
      newStreamId = localStorage.getItem("activeStreamId");
      if (!newStreamId) {
        alert("No active livestream available!");
        return;
      }
    }
    setStreamId(newStreamId);
    setMode(userMode);
  };

  const onStreamLeave = () => {
    setStreamId(null);
    localStorage.removeItem("activeStreamId");
  };

  return authToken && streamId ? (
    <MeetingProvider
      config={{
        meetingId: streamId,
        micEnabled: true,
        webcamEnabled: true,
        name: "John Doe",
        mode,
      }}
      token={authToken}
    >
      <LSContainer streamId={streamId} onLeave={onStreamLeave} />
    </MeetingProvider>
  ) : (
    <JoinView initializeStream={initializeStream} isOrganiser={isOrganiser} />

  );
}

export default LiveStream;
