import "./LiveStream.css";
import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import {
  MeetingProvider,
  useMeeting,
  useParticipant,
  Constants,
} from "@videosdk.live/react-sdk";
import { authToken, createStream } from "./API";
import socket from "./socket";
function JoinView({ initializeStream, isOrganiser ,activeStream}) {
  //const activeStreamId = sessionStorage.getItem("activeStreamId");
  const storedStreamId = sessionStorage.getItem("activeStreamId");

  // This example prefers the activeStream prop, if available.
  const activeStreamId = activeStream || storedStreamId;
  //console.log(activeStreamId);
  const handleAction = async (mode) => {
    await initializeStream("", mode);
  };

  return (
    <div className="video-container">
      {/* If an organiser and there is no active stream, show button to create one */}
      {isOrganiser && !activeStreamId && (
        <button onClick={() => handleAction(Constants.modes.SEND_AND_RECV)}>
          Create Live Stream as Host
        </button>
      )}

      {/* Show join button if a live stream is available */}
      {activeStreamId ? (
        <button onClick={() => handleAction(Constants.modes.RECV_ONLY)}>
          Join Live Stream as Audience
        </button>
      ) : (
        // For non-organisers, show a message when no stream is active.
        !isOrganiser && <p>No active livestreams</p>
      )}
    </div>
  );
}


function LSContainer({ streamId, onLeave,matchData,currentInning,currentInningData ,battingTeam,bowlingTeam }) {
  const [joined, setJoined] = useState(false);
  const { join } = useMeeting({
    onMeetingJoined: () => setJoined(true),
    onMeetingLeft: onLeave,
    onError: (error) => alert(error.message),
  });

  return (
    <div className="container">
      {/* <h3>Stream Id: {streamId}</h3> */}
      {joined ? <StreamView matchData={matchData} currentInning={currentInning} currentInningData={currentInningData} battingTeam={battingTeam} bowlingTeam={bowlingTeam} /> : <button onClick={join}>Join Stream</button>}
    </div>
  );
}

function StreamView({matchData,currentInning,currentInningData,battingTeam,bowlingTeam}) {
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

  function MatchScore({ matchData, currentInning,currentInningData, battingTeam, bowlingTeam }) {
    if (!matchData || !matchData.teams || matchData.teams.length === 0) {
      return <div>Loading match score...</div>;
    }
  
    const isSecondInning = currentInning === 2;
    const score = isSecondInning ? matchData.secondInningScore ?? 0 : matchData.firstInningScore ?? 0;
    const wickets = isSecondInning ? matchData.secondInningWickets ?? 0 : matchData.firstInningWickets ?? 0;
    const overs = isSecondInning ? matchData.secondInningOvers ?? 0 : matchData.firstInningOvers ?? 0;
  
    const target = isSecondInning ? (matchData.firstInningScore ?? 0) + 1 : null;
    const runRate = overs > 0 ? (score / overs).toFixed(2) : "0.00";
  
    return (
      <div className="match-score">
        <span className="team-name">{battingTeam.name}</span>
        <span className="score">{score}/{wickets}</span>
        <span className="overs">Overs: {overs}/{matchData.oversPerSide}</span>
        {target && <span className="target">Target: {target}</span>}
        <span className="run-rate">RR: {runRate}</span>
  
        {/* Later replace with live batters */}
        {(currentInningData?.batting || [])
          .filter(batter => batter.outStatus === "Not Out")
          .map((batter, index) => (
            <span className="batsman" key={index}>
              {batter.batsmanName}
              {batter.onStrike ? "*" : ""} {batter.runs}({batter.ballsFaced})
            </span>
        ))}

  
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

      {isFullScreen && <MatchScore matchData={matchData} currentInning={currentInning} currentInningData={currentInningData} battingTeam={battingTeam} bowlingTeam={bowlingTeam}  />}
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
      <p className="participantInfo">
        {displayName} | Webcam: {webcamOn ? "ON" : "OFF"} | Mic: {micOn ? "ON" : "OFF"}
      </p>
      <audio ref={audioRef} autoPlay muted={isLocal} />
      {webcamOn && (
        <video ref={videoRef} autoPlay muted={isLocal} className="participant-video" style={{ marginBottom:"3px" ,height: isFullScreen ? "80vh" : "150px" }} />
      )}
    </div>
  );
}

function LSControls({ toggleFullScreen, isFullScreen }) {
  const { leave, localMicOn, toggleMic } = useMeeting();

  return (
    <div className="controls">
      <button onClick={leave}>Leave</button>

      <button onClick={() => toggleMic()} className="mute-btn">
        {localMicOn ? "Mute 🔇" : "Unmute 🔊"}
      </button>


      <button onClick={toggleFullScreen} className="fullscreen-btn">
        {isFullScreen ? "Go Minimize" : "Go Full Screen"}
      </button>
    </div>
  );
}



function LiveStream( {isOrganiser,matchData,currentInning,currentInningData,battingTeam,bowlingTeam}) {
  const [streamId, setStreamId] = useState(null);
  const [mode, setMode] = useState(isOrganiser ? Constants.modes.SEND_AND_RECV : Constants.modes.RECV_ONLY);
  const [activeStream, setActiveStream] = useState(null);
  //const isHostUser = true;
  const {matchId}=useParams();
  let streamLocal=null;
  const initializeStream = async (id, userMode) => {
    let newStreamId;
    if (userMode === Constants.modes.SEND_AND_RECV) {
      if (!id) {
        newStreamId = await createStream({ token: authToken });
        sessionStorage.setItem("activeStreamId", newStreamId);
        socket.emit("liveStream",{liveStreamId:newStreamId,matchId:matchId});
      } else {
        newStreamId = id;
      }
    } else if (userMode === Constants.modes.RECV_ONLY) {
      newStreamId = sessionStorage.getItem("activeStreamId");
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
    sessionStorage.removeItem("activeStreamId");
  };
  useEffect(() => {
    const handleLiveStream = ({ liveStreamId }) => {
      console.log("Received live stream ID:", liveStreamId);
      // Set activeStream regardless of mode, if streamId is not already set.
      if (!streamId) {
        setActiveStream(liveStreamId);
        //console.log(streamLocal);
        streamLocal=liveStreamId;
        sessionStorage.setItem("activeStreamId", liveStreamId);
      }
    };

    socket.on("liveStreamClient", handleLiveStream);
    
    return () => {
      socket.off("liveStreamClient", handleLiveStream);
    };
  }, [mode,streamId]);
  //streamLocal=activeStream;
  return authToken && streamId ? (
    <MeetingProvider
      config={{
        meetingId: streamId,
        micEnabled: true,
        webcamEnabled: true,
        name:"Guest",
        mode,
      }}
      token={authToken}
    >
      <LSContainer streamId={streamId} onLeave={onStreamLeave}  matchData={matchData} currentInning={currentInning} currentInningData={currentInningData} battingTeam={battingTeam} bowlingTeam={bowlingTeam} />
    </MeetingProvider>
  ) : (
    <JoinView initializeStream={initializeStream} isOrganiser={isOrganiser} activeStream={streamLocal} />

  );
}

export default LiveStream;
