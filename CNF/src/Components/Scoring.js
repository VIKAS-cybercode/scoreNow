import React, { useState, useEffect,useRef } from "react";
import "./Scoring.css";
import socket from "./socket";

const Scoring = () => {
  // ----- Initial Data -----
  // Define these refs at the top of your component
   const outBatsmanRef = useRef(null);
   const previousNonStrikerRef = useRef(null);
   const stumpOutWide=useRef(0);
   const preRunoutStrikerRef = useRef(null);
   const preRunoutNonStrikerRef = useRef(null);

  const matchId = 123;
  const [inningNumber,setInningNumber]=useState(0);
  useEffect(() => {
    if (matchId) {
      socket.emit("join-room", matchId);
      console.log("Joined room:", matchId);
    }
    return () => {
      socket.emit("leave-room", matchId);
    };
  }, [matchId]);
  
  const allBatsmenList = [
    { id:1, name: "Batsman1", runs: 0, balls: 0 },
    { id:2, name: "Batsman2", runs: 0, balls: 0 },
    { id:3, name: "Batsman3", runs: 0, balls: 0 },
    { id:4, name: "Batsman4", runs: 0, balls: 0 },
    { id:5, name: "Batsman5", runs: 0, balls: 0 },
    { id:6, name: "Batsman6", runs: 0, balls: 0 },
    { id:7, name: "Batsman7", runs: 0, balls: 0 },
    { id:8, name: "Batsman8", runs: 0, balls: 0 },
    { id:9, name: "Batsman9", runs: 0, balls: 0 },
    { id:10, name: "Batsman10", runs: 0, balls: 0 },
    { id:11, name: "Batsman11", runs: 0, balls: 0 },
  ];
  

  // ----- State Variables -----
  const [runs, setRuns] = useState(0);//total runs
  const [wickets, setWickets] = useState(0);// total wickets
  const [totalDeliveries, setTotalDeliveries] = useState(0);// balls till now
  const [currentOverDeliveries, setCurrentOverDeliveries] = useState(0);// ball in current over
  const [totalOversLimit] = useState(10);// totalOver
  const [allBatsmen] = useState(allBatsmenList);// list of batsmen
  const [batsmen, setBatsmen] = useState([]);// pair of striker and not striker batsmen
  const [outBatsmen, setOutBatsmen] = useState([]);// list of batsmen who out

  const [bowlers, setBowlers] = useState([
    { id:1,name: "Bowler1", deliveries: 0, runs: 0, wickets: 0 },
    { id:2,name: "Bowler2", deliveries: 0, runs: 0, wickets: 0 },
  ]);// list of bowlers
  const [currentBowler, setCurrentBowler] = useState(0);// currentBowler
  const [pendingBowlerChange, setPendingBowlerChange] = useState(false); // bowlerChangeBoolValue
  const [showBatsmanModal, setShowBatsmanModal] = useState(false);
  const [showStrikerModal, setShowStrikerModal] = useState(false);
  const [showExtraModal, setShowExtraModal] = useState(false);
  const [showNoBallTypeModal, setShowNoBallTypeModal] = useState(false);
  const [showOutTypeModal, setShowOutTypeModal] = useState(false);
  const [outType, setOutType] = useState("");// outType

  const [showRunOutSelectionModal, setShowRunOutSelectionModal] = useState(false); 
  const [dismissalWasRunOut, setDismissalWasRunOut] = useState(false);
  const [runOutRuns, setRunOutRuns] = useState(0); //runOutRuns

  const [showInitialBatsmenModal, setShowInitialBatsmenModal] = useState(true);
  const [showInitialBowlerModal, setShowInitialBowlerModal] = useState(false);
  const [selectedInitialBatsmen, setSelectedInitialBatsmen] = useState([]);// initial Batsmen

  const [extraType, setExtraType] = useState(null);// extra type
  const [noBallType, setNoBallType] = useState(null);//noballType
  const [lastScored, setLastScored] = useState(""); // lastScoredRuns
  const [gameOver, setGameOver] = useState(false); //gameover or not
  const [allOut, setAllOut] = useState(false);// all out
  const [boundaryType,setBoundaryType]=useState(null);
  // New state for Run Out type check modal and No Ball sub-modals
  const [showRunOutTypeModal, setShowRunOutTypeModal] = useState(false); 
  const [showRunOutNoBallTypeModal, setShowRunOutNoBallTypeModal] = useState(false);
  const [showStumpOutTypeModal, setShowStumpOutTypeModal] = useState(false);
  
  // For current over events display (ball by ball)
  // e.g. ["1", "4", "WD", "OUT", ...]
  const [currentOverEvents, setCurrentOverEvents] = useState([]); // CurrentOverEvents
  const [ballEvent, setBallEvent] = useState(null);
  const [initialPlayersSent, setInitialPlayersSent] = useState(false);

  useEffect(() => {
    if (
      batsmen.length === 2 &&
      bowlers[currentBowler] &&
      !showInitialBatsmenModal &&
      !showInitialBowlerModal &&
      !initialPlayersSent
    ) {
      const payload = {
        matchId,
        inningNumber,
        OverNumber: Math.floor(totalDeliveries / 6),
        ballNumber: totalDeliveries % 6,
        strikerId: batsmen[0]?.id,
        nonStrikerId: batsmen[1]?.id,
        bowlerId: bowlers[currentBowler]?.id,
        runScored: 0,
        isWicket: false,
        wicketType: null,
        newbatsmenid: null,
        boundarytype: boundaryType,
        extraRun: 0,
        extratype: null,
        currentStrikerid: batsmen[0]?.id,
        currentnonstrikerid: batsmen[1]?.id,
        totalRuns: runs,
        Totaloverslimit: totalOversLimit,
        noBalltype: null,
        gameOver,
        Allout: false
      };
  
      socket.emit("initialPlayersSelected", payload);
      console.log("Sent initial players:", payload);
      setInitialPlayersSent(true); // ✅ prevent future emits
    }
  }, [batsmen, currentBowler, showInitialBatsmenModal, showInitialBowlerModal, initialPlayersSent]);
  
  useEffect(() => {
    if (ballEvent) {
      socket.emit("ballEvent", ballEvent);
      console.log("Emitted ball event:", ballEvent);
      setBallEvent(null); // reset for next ball
    }
  }, [ballEvent]);
  useEffect(() => {
    if (gameOver) {
      const payload = {
        matchId,
        inningNumber,
        OverNumber: Math.floor(totalDeliveries / 6),
        ballNumber: totalDeliveries % 6,
        strikerId: batsmen[0]?.id,
        nonStrikerId: batsmen[1]?.id,
        bowlerId: bowlers[currentBowler]?.id,
        runScored: 0,
        isWicket: false,
        wicketType: null,
        newbatsmenid: null,
        boundarytype: null,
        extraRun: 0,
        extratype: null,
        currentStrikerid: batsmen[0]?.id,
        currentnonstrikerid: batsmen[1]?.id,
        totalRuns: runs,
        Totaloverslimit: totalOversLimit,
        noBalltype: null,
        gameOver: true,
        Allout: allOut
      };
  
      socket.emit("gameOverEvent", payload);
      console.log("Game Over Event Sent:", payload);
    }
  }, [gameOver]);
  
  // ----- Helper Functions -----
  const isGameOver = (legalDeliveries) =>
    legalDeliveries >= totalOversLimit * 6;

  const isTeamAllOut = () => {
    // Use name comparison to check if a batsman is already in play or out.
    const availableBatsmen = allBatsmen.filter(
      (b) =>
        !batsmen.some((bt) => bt && bt.name === b.name) &&
        !outBatsmen.some((ob) => ob && ob.name === b.name)
    );
    
    
    return availableBatsmen.length === 0;
  };

  // Resets current over events when an over is completed
  const resetCurrentOverEvents = () => {
    setCurrentOverEvents([]);
  };

  // Add an event to the current over list; for any out, we simply show "OUT"
  const addCurrentOverEvent = (event) => {
    if (event.toLowerCase().includes("out")) {
      setCurrentOverEvents((prev) => [...prev, "OUT"]);
    } else {
      setCurrentOverEvents((prev) => [...prev, event]);
    }
  };

  // ----- Ball Handling -----

  const handleRun = (run,bt=null) => {
    if (gameOver || allOut) return;
  
    const newTotalDeliveries = totalDeliveries + 1;
    const newCurrentOverDeliveries = currentOverDeliveries + 1;
  
    const striker = batsmen[0];
    const nonStriker = batsmen[1];
    let updatedBatsmen = batsmen.map((batsman, index) =>
      index === 0
        ? { ...batsman, runs: batsman.runs + run, balls: batsman.balls + 1 }
        : batsman
    );
  
    // Determine if strike changes after run
    if (run % 2 === 1) {
      updatedBatsmen = [updatedBatsmen[1], updatedBatsmen[0]];
    }
  
    const isOverCompleted = newCurrentOverDeliveries === 6;
    if (isOverCompleted) {
      updatedBatsmen = [updatedBatsmen[1], updatedBatsmen[0]];
    }
  
    const newBowlers = bowlers.map((bowler, index) =>
      index === currentBowler
        ? {
            ...bowler,
            deliveries: bowler.deliveries + 1,
            runs: bowler.runs + run,
          }
        : bowler
    );
  
    setRuns((prev) => prev + run);
    setTotalDeliveries(newTotalDeliveries);
    setCurrentOverDeliveries(isOverCompleted ? 0 : newCurrentOverDeliveries);
    setBatsmen(updatedBatsmen);
    setBowlers(newBowlers);
    setPendingBowlerChange(isOverCompleted && !isGameOver(newTotalDeliveries));
    setGameOver(isGameOver(newTotalDeliveries));
    setLastScored(run.toString());
  
    addCurrentOverEvent(run.toString());
    if (isOverCompleted) resetCurrentOverEvents();
  
    // Set ballEvent for socket emit
    setBallEvent({
      matchId,
      inningNumber,
      OverNumber: Math.floor(newTotalDeliveries / 6),
      ballNumber: newTotalDeliveries % 6,
      strikerId: striker?.id,
      nonStrikerId: nonStriker?.id,
      bowlerId: bowlers[currentBowler]?.id,
      runScored: run,
      isWicket: false,
      wicketType: null,
      newbatsmenid: null,
      boundaryType: bt, // only explicitly set when using FOUR/SIX button
      extraRun: 0,
      extratype: null,
      currentStrikerid: updatedBatsmen[0]?.id,
      currentnonstrikerid: updatedBatsmen[1]?.id,
      totalRuns: runs + run,
      Totaloverslimit: totalOversLimit,
      noBalltype: null,
      gameOver: isGameOver(newTotalDeliveries),
      Allout: allOut,
    });
  };
  

  // For non-run-out dismissals
  const handleNonRunOutOut = (dismissalType) => {
    const newTotalDeliveries = totalDeliveries + 1;
    const newCurrentOverDeliveries = currentOverDeliveries + 1;
    const outBatsman = batsmen[0];
    const nonStriker = batsmen[1];

  // Save for later use
    outBatsmanRef.current = outBatsman;
    previousNonStrikerRef.current = nonStriker;
     //const outBatsman = batsmen[0];
    const newOutBatsmen = [...outBatsmen, outBatsman];
    // Remove the out batsman; keep the other on strike
    const newBatsmen = [null, nonStriker]

    // Update bowler stats
    const newBowlers = bowlers.map((bowler, index) =>
      index === currentBowler
        ? {
            ...bowler,
            deliveries: bowler.deliveries + 1,
            wickets: bowler.wickets + 1,
          }
        : bowler
    );

    const isOverCompleted = newCurrentOverDeliveries === 6;
    const gameOverStatus = isGameOver(newTotalDeliveries);
    const allOutStatus = isTeamAllOut();

    setWickets((prev) => prev + 1);
    setTotalDeliveries(newTotalDeliveries);
    setCurrentOverDeliveries(isOverCompleted ? 0 : newCurrentOverDeliveries);
    setBatsmen(newBatsmen);
    setOutBatsmen(newOutBatsmen);
    setBowlers(newBowlers);
    setPendingBowlerChange(isOverCompleted && !gameOverStatus && !allOutStatus);
    setShowOutTypeModal(false);
    setShowBatsmanModal(!allOutStatus);
    setAllOut(allOutStatus);
    setLastScored(dismissalType);
    setGameOver(gameOverStatus || allOutStatus);

    // Add event to current over
    addCurrentOverEvent("OUT");
    if (isOverCompleted) {
      resetCurrentOverEvents();
    }
  };

  // Called after runs are selected via the extra modal and type selection for Run Out
  const handleRunOut = (selectedBatsman, runOutType, noBallSubType = null) => {
    // Base delivery increment
    let newTotalDeliveries = totalDeliveries + 1;
    let newCurrentOverDeliveries = currentOverDeliveries + 1;
    preRunoutStrikerRef.current = batsmen[0]?.id;
    preRunoutNonStrikerRef.current = batsmen[1]?.id;
    // Update striker’s score & ball count based on type
    let newBatsmenData = [...batsmen];
    let updatedBatsmen = newBatsmenData;
    let newRuns = runs;
    let newBowlers = bowlers.map((bowler, index) =>
      index === currentBowler
        ? { ...bowler, deliveries: bowler.deliveries + 1, wickets: bowler.wickets + 1 }
        : bowler
    );

    // Handle different Run Out types
    if (runOutType === "Normal") {
      // Usual Run Out logic
      newBatsmenData = batsmen.map((batsman, index) =>
        index === 0
          ? { ...batsman, runs: batsman.runs + runOutRuns, balls: batsman.balls + 1 }
          : { ...batsman }
      );
      if (runOutRuns % 2 === 1) {
        updatedBatsmen = [newBatsmenData[1], newBatsmenData[0]];
      }
      newRuns = runs + runOutRuns;
      newBowlers = bowlers.map((bowler, index) =>
        index === currentBowler
          ? { ...bowler, runs: bowler.runs + runOutRuns }
          : bowler
      );
    } else if (runOutType === "Wide") {
      // No ball increase, 1 extra run to bowler, no runs to batsman
      newRuns = runs + 1; // Extra run for wide
      newBowlers = bowlers.map((bowler, index) =>
        index === currentBowler
          ? { ...bowler, runs: bowler.runs + 1 }
          : bowler
      );
      // Balls do not increase, handled by not updating batsman.balls
    } else if (runOutType === "NoBall") {
      if (noBallSubType === "Off the Bat") {
        // Batsman gets runs scored (not extra), bowler gets runs scored + 1, balls do not increase
        newBatsmenData = batsmen.map((batsman, index) =>
          index === 0 ? { ...batsman, runs: batsman.runs + runOutRuns } : { ...batsman }
        );
        updatedBatsmen = newBatsmenData;
        newRuns = runs + runOutRuns; // Runs scored by batsman
        newBowlers = bowlers.map((bowler, index) =>
          index === currentBowler
            ? { ...bowler, runs: bowler.runs + runOutRuns + 1 }
            : bowler
        );
        // Balls do not increase
      } else if (noBallSubType === "Bye/Leg Bye") {
        // Runs scored not given to batsman, balls not increased, only 1 run to bowler
        newRuns = runs + 1; // Only 1 run to bowler (extra)
        newBowlers = bowlers.map((bowler, index) =>
          index === currentBowler
            ? { ...bowler, runs: bowler.runs + 1 }
            : bowler
        );
        // No runs to batsman, balls do not increase
      }
    } else if (runOutType === "Bye" || runOutType === "Leg Bye") {
      // Neither batsman nor bowler gets runs (except scored runs), ball increases by 1
      newBatsmenData = batsmen.map((batsman, index) =>
        index === 0
          ? { ...batsman, balls: batsman.balls + 1 }
          : { ...batsman }
      );
      if (runOutRuns % 2 === 1) {
        updatedBatsmen = [newBatsmenData[1], newBatsmenData[0]];
      }
      newRuns = runs; // No runs added
      newBowlers = bowlers.map((bowler, index) =>
        index === currentBowler
          ? { ...bowler, runs: bowler.runs }
          : bowler
      );
    }

    // Remove the batsman that got run out
    const newOutBatsmen = [...outBatsmen, selectedBatsman];
    const remainingBatsman =
      updatedBatsmen[0].name === selectedBatsman.name ? updatedBatsmen[1] : updatedBatsmen[0];
    const newBatsmen = [remainingBatsman];

    const isOverCompleted = newCurrentOverDeliveries === 6;
    const gameOverStatus = isGameOver(newTotalDeliveries);
    const allOutStatus = isTeamAllOut();

    setRuns(newRuns);
    setWickets((prev) => prev + 1);
    setTotalDeliveries(newTotalDeliveries);
    setCurrentOverDeliveries(isOverCompleted ? 0 : newCurrentOverDeliveries);
    setBatsmen(newBatsmen);
    setOutBatsmen(newOutBatsmen);
    setBowlers(newBowlers);
    setPendingBowlerChange(isOverCompleted && !gameOverStatus && !allOutStatus);
    setShowRunOutSelectionModal(false);
    setShowBatsmanModal(!allOutStatus);
    setAllOut(allOutStatus);
    setLastScored(
        runOutType === "Normal"
          ? `Run Out (${runOutRuns} run${runOutRuns === 1 ? "" : "s"} completed)`
          : runOutType === "Wide"
          ? "Run Out (Wide)"
          : runOutType === "NoBall"
          ? `Run Out (No Ball - ${noBallSubType || "Bye/Leg Bye"})`
          : runOutType === "Bye"
          ? `Run Out (Bye - ${runOutRuns} run${runOutRuns === 1 ? "" : "s"} attempted)`
          : runOutType === "Leg Bye"
          ? `Run Out (Leg Bye - ${runOutRuns} run${runOutRuns === 1 ? "" : "s"} attempted)`
          : "Run Out"
      );
      
    setGameOver(gameOverStatus || allOutStatus);
    setRunOutRuns(0);

    addCurrentOverEvent("OUT");
    if (isOverCompleted) {
      resetCurrentOverEvents();
    }
  };

  const handleOutButton = () => {
    if (gameOver || allOut) return;
    setShowOutTypeModal(true);
  };

  const handleOutTypeSelection = (type) => {
    setOutType(type);
    if (type === "Run Out") {
      setDismissalWasRunOut(true);
      setExtraType("Run Out");
      setShowOutTypeModal(false);
      setShowExtraModal(true);
    } else if (type === "Stump Out") {
      setShowStumpOutTypeModal(true);
      setShowOutTypeModal(false);
    } else {
      handleNonRunOutOut(type);
    }
  };

  // Handle Run Out type selection
  const handleRunOutTypeSelection = (runOutType) => {
    if (runOutType === "NoBall") {
      setShowRunOutNoBallTypeModal(true);
      setShowExtraModal(false);
    } else {
      setRunOutRuns(0); // Reset runs for Wide, Bye, Leg Bye, or Normal
      setShowExtraModal(false);
      setShowRunOutSelectionModal(true);
    }
    setShowRunOutTypeModal(false);
  };

  // Handle Run Out No Ball sub-type selection
  const handleRunOutNoBallTypeSelection = (noBallSubType) => {
    setNoBallType(noBallSubType);
    setShowRunOutNoBallTypeModal(false);
    setShowExtraModal(false);
    setShowRunOutSelectionModal(true);
  };

  // Handle Stump Out based on wide/normal selection
  const handleStumpOutTypeSelection = (isWide) => {
    let newTotalDeliveries = totalDeliveries + 1;
    const newCurrentOverDeliveries = currentOverDeliveries + 1;
    const outBatsman = batsmen[0];
    const nonStriker = batsmen[1];

  // Save for later use
    outBatsmanRef.current = outBatsman;
    previousNonStrikerRef.current = nonStriker;
    stumpOutWide.current = isWide ? 1 : 0;

   // const outBatsman = batsmen[0];
    const newOutBatsmen = [...outBatsmen, outBatsman];
    const newBatsmen = [batsmen[1]];

    let newRuns = runs;
    let newBowlers = bowlers.map((bowler, index) =>
      index === currentBowler
        ? { ...bowler, deliveries: bowler.deliveries + 1, wickets: bowler.wickets + 1 }
        : bowler
    );

    if (isWide) {
      newTotalDeliveries = newTotalDeliveries - 1;
      newRuns = runs + 1;
      newBowlers = bowlers.map((bowler, index) =>
        index === currentBowler
          ? { ...bowler, deliveries: bowler.deliveries + 1, runs: bowler.runs + 1, wickets: bowler.wickets + 1 }
          : bowler
      );
    }

    const isOverCompleted = newCurrentOverDeliveries === 6;
    const gameOverStatus = isGameOver(newTotalDeliveries);
    const allOutStatus = isTeamAllOut();

    setWickets((prev) => prev + 1);
    setTotalDeliveries(newTotalDeliveries);
    setCurrentOverDeliveries(isOverCompleted ? 0 : newCurrentOverDeliveries);
    setBatsmen(newBatsmen);
    setOutBatsmen(newOutBatsmen);
    setBowlers(newBowlers);
    setRuns(newRuns);
    setPendingBowlerChange(isOverCompleted && !gameOverStatus && !allOutStatus);
    setShowStumpOutTypeModal(false);
    setShowBatsmanModal(!allOutStatus);
    setAllOut(allOutStatus);
    setLastScored(isWide ? "Stump Out (Wide)" : "Stump Out");
    setGameOver(gameOverStatus || allOutStatus);

    addCurrentOverEvent("OUT");
    if (isOverCompleted) {
      resetCurrentOverEvents();
    }
  };

  // Extra runs handling for extras and Run Out
  const handleExtraRuns = (selectedRuns) => {
    const preBallStrikerId = batsmen[0]?.id;
    const preBallNonStrikerId = batsmen[1]?.id;
    if (extraType === "Run Out") {
      setRunOutRuns(selectedRuns);
      setShowExtraModal(false);
      setShowRunOutTypeModal(true); // Trigger Run Out type selection modal
      return;
    }

    // For other extras (WD, NB, BYE, LB)
    let runsToAdd = 0;
    let addToBowlerRuns = 0;
    let swapBatsmen = false;
    let updatedBatsmen = [...batsmen];
    let incrementDelivery = false;

    if (extraType === "WD") {
      runsToAdd = 1 + selectedRuns;
      addToBowlerRuns = runsToAdd;
      swapBatsmen = selectedRuns % 2 === 1;
    } else if (extraType === "NB") {
      runsToAdd = 1 + selectedRuns;
      addToBowlerRuns = 1;
      swapBatsmen = selectedRuns % 2 === 1;
      if (noBallType === "bat") {
        updatedBatsmen = updatedBatsmen.map((batsman, index) =>
          index === 0 ? { ...batsman, runs: batsman.runs + selectedRuns } : batsman
        );
        addToBowlerRuns = selectedRuns;
      }
    } else if (extraType === "BYE" || extraType === "LB") {
      runsToAdd = selectedRuns;
      addToBowlerRuns = 0;
      incrementDelivery = true;
      updatedBatsmen = updatedBatsmen.map((batsman, index) =>
        index === 0 ? { ...batsman, balls: batsman.balls + 1 } : batsman
      );
      swapBatsmen = runsToAdd % 2 === 1;
    }

    if (swapBatsmen) {
      updatedBatsmen = [updatedBatsmen[1], updatedBatsmen[0]];
    }

    let newTotalDeliveries = totalDeliveries;
    let newCurrentOverDeliveries = currentOverDeliveries;
    if (incrementDelivery) {
      newTotalDeliveries += 1;
      newCurrentOverDeliveries += 1;
    }

    const isOverCompleted = newCurrentOverDeliveries === 6;
    const newBowlers = bowlers.map((bowler, index) =>
      index === currentBowler
        ? {
            ...bowler,
            deliveries: incrementDelivery ? bowler.deliveries + 1 : bowler.deliveries,
            runs: bowler.runs + addToBowlerRuns,
          }
        : bowler
    );

    const gameOverStatus = isGameOver(newTotalDeliveries);

    setRuns((prev) => prev + runsToAdd);
    setTotalDeliveries(newTotalDeliveries);
    setCurrentOverDeliveries(isOverCompleted ? 0 : newCurrentOverDeliveries);
    setBatsmen(updatedBatsmen);
    setBowlers(newBowlers);
    setShowExtraModal(false);
    setPendingBowlerChange(incrementDelivery && isOverCompleted && !gameOverStatus);
    setLastScored(
      extraType +
        (extraType === "NB" && noBallType ? ` (${noBallType})` : "") +
        " + " +
        runsToAdd +
        " runs"
    );
    setGameOver(gameOverStatus);
    const ballEventPayload = {
      matchId,
      inningNumber,
      OverNumber: Math.floor(newTotalDeliveries / 6),
      ballNumber: newTotalDeliveries % 6,
      strikerId: preBallStrikerId, // ✅ before ball
      nonStrikerId: preBallNonStrikerId, // ✅ before ball
      bowlerId: bowlers[currentBowler]?.id,
      runScored: runsToAdd,
      isWicket: false,
      wicketType: null,
      newbatsmenid: null,
      boundarytype: null,
      extraRun: runsToAdd,
      extratype: extraType,
      currentStrikerid: updatedBatsmen[0]?.id, // ✅ after ball
      currentnonstrikerid: updatedBatsmen[1]?.id, // ✅ after ball
      totalRuns: runs + runsToAdd,
      Totaloverslimit: totalOversLimit,
      noBalltype: extraType === "NB" ? noBallType : null,
      gameOver: gameOverStatus,
      Allout: false,
    };
    
    socket.emit("ballEvent", ballEventPayload);
    console.log("Emitted extra ball event:", ballEventPayload);

    addCurrentOverEvent(
      extraType === "NB" && noBallType === "bat"
        ? `NB${selectedRuns}` // ✅ valid string interpolation
        : extraType
    );
    
    if (isOverCompleted) {
      resetCurrentOverEvents();
    }
    setExtraType(null);
  };

  // ----- Batsman & Bowler Selection -----

  const handleSelectBatsman = (selectedBatsman) => {
    setBatsmen((prev) => {
      const outBatsman = outBatsmanRef.current;
      const nonStriker = previousNonStrikerRef.current;
      
   const  newBatsmen = [selectedBatsman, nonStriker]; // striker first
      
      if (dismissalWasRunOut) {
        setShowBatsmanModal(false);
        setShowStrikerModal(true);
        setDismissalWasRunOut(false);
      } else {
        setShowBatsmanModal(false);
        const isStumpWide = stumpOutWide.current === 1;
        const payload = {
          matchId,
          inningNumber,
          OverNumber: Math.floor(totalDeliveries / 6),
          ballNumber: totalDeliveries % 6,
          strikerId: outBatsman,
          nonStrikerId: nonStriker,
          bowlerId: bowlers[currentBowler]?.id,
          runScored: 0,
          isWicket: true,
          wicketType: outType,
          newbatsmenid: selectedBatsman,
          boundarytype: null,
          extraRun: isStumpWide ? 1 : 0,
          extratype: isStumpWide ? "WD" : (extraType === "Run Out" ? null : extraType),
          currentStrikerid: selectedBatsman,
          currentnonstrikerid:nonStriker,
          totalRuns: runs,
          Totaloverslimit: totalOversLimit,
          noBalltype: null,
          gameOver,
          Allout: allOut
        };
    
        socket.emit("wicketEvent", payload);
        console.log("Wicket Event Sent:other than Run out", payload);
        stumpOutWide.current = 0;
      }
      return newBatsmen;
    });
  };

  const handleStrikerSelection = (selectedBatsman) => {
    setBatsmen((prev) => {
      const other = prev.find((b) => b.name !== selectedBatsman.name);
      const updatedBatsmen = [selectedBatsman, other];
      setShowStrikerModal(false);
      const payload = {
        matchId,
        inningNumber,
        OverNumber: Math.floor(totalDeliveries / 6),
        ballNumber: totalDeliveries % 6,
        strikerId: preRunoutStrikerRef.current, // batsman who got out
        nonStrikerId: preRunoutNonStrikerRef.current,
        bowlerId: bowlers[currentBowler]?.id,
        runScored: 0,
        isWicket: true,
        wicketType: outType,
        newbatsmenid: selectedBatsman?.id, // just selected batsman
        boundarytype: null,
        extraRun: 0,
        extratype: extraType === "Run Out" ? null : extraType,
        currentStrikerid: updatedBatsmen[0]?.id,
        currentnonstrikerid: updatedBatsmen[1]?.id,
        totalRuns: runs,
        Totaloverslimit: totalOversLimit,
        noBalltype: noBallType,
        gameOver,
        Allout: allOut
      };
  
      socket.emit("wicketEvent", payload);
      console.log("wicket event Runout",payload);
      return [selectedBatsman, other];
    });
  };

  const handleSelectInitialBatsman = (batsman) => {
    setSelectedInitialBatsmen((prev) => {
      let selected = [...prev];
      if (!selected.find((b) => b.name === batsman.name)) {
        selected.push(batsman);
      }
      if (selected.length === 2) {
        setBatsmen(selected);
        setShowInitialBatsmenModal(false);
        setShowInitialBowlerModal(true);
      }
      return selected;
    });
  };

  const handleSelectInitialBowler = (index) => {
    setCurrentBowler(index);
    setShowInitialBowlerModal(false);
  };

  const handleSelectBowler = (index) => {
    setCurrentBowler(index);
    setPendingBowlerChange(false);
    const newBowler = bowlers[index];
    const payload = {
      matchId,
      inningNumber,
      OverNumber: Math.floor(totalDeliveries / 6),
      ballNumber: totalDeliveries % 6,
      strikerId: batsmen[0]?.id,
      nonStrikerId: batsmen[1]?.id,
      bowlerId: newBowler?.id,
      runScored: 0,
      isWicket: false,
      wicketType: null,
      newbatsmenid: null,
      boundarytype: null,
      extraRun: 0,
      extratype: null,
      currentStrikerid: batsmen[0]?.id,
      currentnonstrikerid: batsmen[1]?.id,
      totalRuns: runs,
      Totaloverslimit: totalOversLimit,
      noBalltype: null,
      gameOver,
      Allout: false
    };
  
    socket.emit("bowlerChanged", payload);
    console.log("Sent bowler change payload:", payload);
  };

  // ----- Derived values for display -----
  const totalOversDisplay =
    Math.floor(totalDeliveries / 6) + (totalDeliveries % 6) / 10;

  const currentBowlerData = bowlers[currentBowler];
  const bowlerOvers =
    Math.floor(currentBowlerData.deliveries / 6) +
    (currentBowlerData.deliveries % 6) / 10;

  // IMPORTANT: Use name-based filtering to prevent showing batsmen that are already playing
  const availableBatsmen = allBatsmen.filter(
    (b) =>
      !batsmen.some((bt) => bt && bt.name === b.name) &&
      !outBatsmen.some((ob) => ob && ob.name === b.name)
  );

  // ----- Main handleScore function -----
  const handleScore = (type, value, source = "custom") => {
    if (gameOver || allOut) return;
    if (type === "run") {
      const run = parseInt(value);
      const bt = (source === "button" && (run === 4 || run === 6)) ? value : null;
      if (source === "button" && (run === 4 || run === 6)) {
        setBoundaryType(value); // ✅ only set when from button
        console.log(boundaryType);
      } else {
        setBoundaryType(null);
      }
      handleRun(run,bt);
    } else if (type === "extra") {
      if (value === "NB") {
        setShowNoBallTypeModal(true);
        setExtraType(value);
      } else {
        setShowExtraModal(true);
        setExtraType(value);
      }
    } else if (type === "out") {
      handleOutButton();
    }
  };

  return (
    <div className="app">
      <div className="scoing-main-div">
        <Header />
        <ScoreDisplay
          runs={runs}
          wickets={wickets}
          overs={totalOversDisplay}
          totalOvers={totalOversLimit}
          tossInfo="Team A won the toss and elected to bat"
        />

        {gameOver && !allOut && (
          <div className="game-over">Game Over: Maximum overs reached!</div>
        )}
        {allOut && (
          <div className="game-over">
            All Out: Team is all out! Inning Over!
          </div>
        )}

        {/* Display current over's ball-by-ball events */}
        <CurrentOverEvents events={currentOverEvents} />

        <div className="player-info">
          <PlayerInfo type="batsman" players={batsmen} />
          <PlayerInfo
            type="bowler"
            player={{ ...currentBowlerData, overs: bowlerOvers, maidens: 0 }}
          />
        </div>

        <ScoringButtons onScore={handleScore} lastScored={lastScored} disabled={gameOver || allOut} />

        {/* ------------- Modals ------------- */}
        {showNoBallTypeModal && (
          <Modal>
            <h3>No Ball: Runs off the bat or bye/leg bye?</h3>
            <button
              onClick={() => {
                setShowNoBallTypeModal(false);
                setShowExtraModal(true);
                setNoBallType("bat");
                setExtraType("NB");
              }}
            >
              Off the Bat
            </button>
            <button
              onClick={() => {
                setShowNoBallTypeModal(false);
                setShowExtraModal(true);
                setNoBallType("bye/leg bye");
                setExtraType("NB");
              }}
            >
              Bye/Leg Bye
            </button>
          </Modal>
        )}

        {showExtraModal && (
          <Modal>
            <h3>Select runs for {extraType}</h3>
            {[0, 1, 2, 3, 4, 5, 6].map((run) => (
              <button key={run} onClick={() => handleExtraRuns(run)}>
                {run}
              </button>
            ))}
          </Modal>
        )}

        {showOutTypeModal && (
          <Modal>
            <h3>Select Dismissal Type</h3>
            <button onClick={() => handleOutTypeSelection("Bowled")}>
              Bowled
            </button>
            <button onClick={() => handleOutTypeSelection("Catch")}>
              Catch
            </button>
            <button onClick={() => handleOutTypeSelection("Stump Out")}>
              Stump Out
            </button>
            <button onClick={() => handleOutTypeSelection("Hit Wicket")}>
              Hit Wicket
            </button>
            <button onClick={() => handleOutTypeSelection("Retired Hurt")}>
              Retired Hurt
            </button>
            <button onClick={() => handleOutTypeSelection("LBW")}>
              LBW
            </button>
            <button onClick={() => handleOutTypeSelection("Run Out")}>
              Run Out
            </button>
          </Modal>
        )}

        {showRunOutSelectionModal && (
          <Modal>
            <h3>Select Batsman Who is Out</h3>
            {batsmen.map((batsman, index) => (
              <button
                key={index}
                onClick={() => handleRunOut(batsman, outType, noBallType)}
              >
                {batsman.name}
              </button>
            ))}
          </Modal>
        )}

        {showRunOutTypeModal && (
          <Modal>
            <h3>Run Out: Was it Normal, Wide, No Ball, Bye, or Leg Bye?</h3>
            <button onClick={() => handleRunOutTypeSelection("Normal")}>
              Normal
            </button>
            <button onClick={() => handleRunOutTypeSelection("Wide")}>
              Wide
            </button>
            <button onClick={() => handleRunOutTypeSelection("NoBall")}>
              No Ball
            </button>
            <button onClick={() => handleRunOutTypeSelection("Bye")}>
              Bye
            </button>
            <button onClick={() => handleRunOutTypeSelection("Leg Bye")}>
              Leg Bye
            </button>
          </Modal>
        )}

        {showRunOutNoBallTypeModal && (
          <Modal>
            <h3>No Ball: Off the Bat or Bye/Leg Bye?</h3>
            <button onClick={() => handleRunOutNoBallTypeSelection("Off the Bat")}>
              Off the Bat
            </button>
            <button onClick={() => handleRunOutNoBallTypeSelection("Bye/Leg Bye")}>
              Bye/Leg Bye
            </button>
          </Modal>
        )}

        {showStumpOutTypeModal && (
          <Modal>
            <h3>Stump Out: Was it a Wide or Normal delivery?</h3>
            <button
              onClick={() => {
                handleStumpOutTypeSelection(false); // Normal
              }}
            >
              Normal
            </button>
            <button
              onClick={() => {
                handleStumpOutTypeSelection(true); // Wide
              }}
            >
              Wide
            </button>
          </Modal>
        )}

        {showBatsmanModal && (
          <Modal>
            <h3>Select Next Batsman</h3>
            {availableBatsmen.map((batsman, index) => (
              <button key={index} onClick={() => handleSelectBatsman(batsman)}>
                {batsman.name}
              </button>
            ))}
          </Modal>
        )}

        {showStrikerModal && (
          <Modal>
            <h3>Select Striker</h3>
            {batsmen.filter(Boolean).map((batsman, index) => (
            <button key={index} onClick={() => handleStrikerSelection(batsman)}>
               {batsman.name}
            </button>
             ))}
          </Modal>
        )}

        {pendingBowlerChange && (
          <Modal>
            <h3>Select Next Bowler</h3>
            {bowlers.map((bowler, index) => (
              <button key={index} onClick={() => handleSelectBowler(index)}>
                {bowler.name}
              </button>
            ))}
          </Modal>
        )}

        {showInitialBatsmenModal && (
          <Modal>
            <h3>Select Opening Batsmen</h3>
            <p>
              {selectedInitialBatsmen.length > 0 &&
                "Selected: " +
                selectedInitialBatsmen.map((b) => b.name).join(", ")}
            </p>
            {allBatsmen.map((batsman, index) => (
              <button
                key={index}
                onClick={() => handleSelectInitialBatsman(batsman)}
                disabled={selectedInitialBatsmen.find((b) => b.name === batsman.name)}
              >
                {batsman.name}
              </button>
            ))}
          </Modal>
        )}

        {showInitialBowlerModal && (
          <Modal>
            <h3>Select Opening Bowler</h3>
            {bowlers.map((bowler, index) => (
              <button key={index} onClick={() => handleSelectInitialBowler(index)}>
                {bowler.name}
              </button>
            ))}
          </Modal>
        )}
      </div>
    </div>
  );
};

/* ----------------- Helper Components ----------------- */

const Header = () => (
  <div className="header">
    <h1>Cricket Scoring</h1>
  </div>
);

const ScoreDisplay = ({ runs, wickets, overs, totalOvers, tossInfo }) => (
  <div className="score-display">
    <h2>
      {runs}/{wickets} ({overs}/{totalOvers})
    </h2>
    <p>{tossInfo}</p>
  </div>
);

// Shows the ball-by-ball events in the current over horizontally
const CurrentOverEvents = ({ events }) => {
  return (
    <div className="current-over-events">
      {events.map((evt, index) => (
        <span key={index} className="ball-event">
          {evt}
        </span>
      ))}
    </div>
  );
};

const PlayerInfo = ({ type, players, player }) => {
  if (type === "batsman") {
    return (
      <div className="batsmen-info">
        <h3>Batsmen</h3>
        {players.map((batsman, index) => (
          batsman ? (
            <p key={index}>
              {batsman.name}: {batsman.runs} ({batsman.balls})
              {index === 0 ? " *" : ""}
            </p>
          ) : (
            <p key={index}>Waiting for new batsman...</p>
          )
        ))}
      </div>
    );
  } else if (type === "bowler") {
    return (
      <div className="bowler-info">
        <h3>Bowler</h3>
        <p>
          {player.name}: {player.overs}-{player.maidens}-{player.runs}-
          {player.wickets}
        </p>
      </div>
    );
  }
  return null;
};

const ScoringButtons = ({ onScore, lastScored, disabled }) => {
  const [customRun, setCustomRun] = useState("");

  return (
    <div className="scoring-buttons">
      <div>
        <button onClick={() => onScore("run", "0")} disabled={disabled}>
          0
        </button>
        <button onClick={() => onScore("run", "1")} disabled={disabled}>
          1
        </button>
        <button onClick={() => onScore("run", "2")} disabled={disabled}>
          2
        </button>
        <button onClick={() => onScore("run", "4", "button")} disabled={disabled}>
          FOUR
        </button>
        <button onClick={() => onScore("run", "6", "button")} disabled={disabled}>
          SIX
        </button>
        <input
          type="number"
          value={customRun}
          onChange={(e) => setCustomRun(e.target.value)} style={{ width: "60px" ,height:"40px" }}
        />
        <button onClick={() => onScore("run", customRun)} disabled={disabled}>
          Submit Custom Run
        </button>
      </div>
      <div>
        <button onClick={() => onScore("extra", "WD")} disabled={disabled}>
          WD
        </button>
        <button onClick={() => onScore("extra", "NB")} disabled={disabled}>
          NB
        </button>
        <button onClick={() => onScore("extra", "BYE")} disabled={disabled}>
          BYE
        </button>
        <button onClick={() => onScore("extra", "LB")} disabled={disabled}>
          LB
        </button>
        <button onClick={() => onScore("out", "OUT")} disabled={disabled}>
          OUT
        </button>
      </div>
      <p>Last Scored: {lastScored}</p>
    </div>
  );
};


const Modal = ({ children }) => {
  return (
    <div className="modal">
      <div className="modal-content">{children}</div>
    </div>
  );
};

export default Scoring;