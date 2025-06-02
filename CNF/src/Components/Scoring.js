import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import "./Scoring.css";
import socket from "./socket";

const Scoring = () => {
  // ----- Initial Data -----
  const outBatsmanRef = useRef(null);
  const previousNonStrikerRef = useRef(null);
  const stumpOutWide = useRef(0);
  const preRunoutStrikerRef = useRef(null);
  const preRunoutNonStrikerRef = useRef(null);

  const { matchId } = useParams();
  const [inningNumber, setInningNumber] = useState(1);
  const [targetScore, setTargetScore] = useState(null);
  const [battingOrder, setBattingOrder] = useState([]);
  const [bowlingOrder, setBowlingOrder] = useState([]);
  const [winCondition, setWinCondition] = useState(null);

  // ----- State Variables -----
  const [runs, setRuns] = useState(0);
  const [wickets, setWickets] = useState(0);
  const [totalDeliveries, setTotalDeliveries] = useState(0);
  const [currentOverDeliveries, setCurrentOverDeliveries] = useState(0);
  const [totalOversLimit] = useState(10);
  const [allBatsmen, setAllBatsmen] = useState([
    { id: 1, name: "Batsman1", runs: 0, balls: 0 },
    { id: 2, name: "Batsman2", runs: 0, balls: 0 },
    { id: 3, name: "Batsman3", runs: 0, balls: 0 },
    { id: 4, name: "Batsman4", runs: 0, balls: 0 },
    { id: 5, name: "Batsman5", runs: 0, balls: 0 },
    { id: 6, name: "Batsman6", runs: 0, balls: 0 },
    { id: 7, name: "Batsman7", runs: 0, balls: 0 },
    { id: 8, name: "Batsman8", runs: 0, balls: 0 },
    { id: 9, name: "Batsman9", runs: 0, balls: 0 },
    { id: 10, name: "Batsman10", runs: 0, balls: 0 },
    { id: 11, name: "Batsman11", runs: 0, balls: 0 },
  ]);
  const [batsmen, setBatsmen] = useState([]);
  const [outBatsmen, setOutBatsmen] = useState([]);
  const [battingTeamId, setBattingTeamId] = useState(null);
  const [bowlingTeamId, setBowlingTeamId] = useState(null);
  const [battingTeamName, setBattingTeamName] = useState(null);
  const [bowlingTeamName, setBowlingTeamName] = useState(null);
  const [bowlers, setBowlers] = useState([
    { id: 1, name: "Bowler1", deliveries: 0, runs: 0, wickets: 0 },
    { id: 2, name: "Bowler2", deliveries: 0, runs: 0, wickets: 0 },
  ]);
  const [currentBowler, setCurrentBowler] = useState(0);
  const [pendingBowlerChange, setPendingBowlerChange] = useState(false);
  const [showBatsmanModal, setShowBatsmanModal] = useState(false);
  const [showExtraModal, setShowExtraModal] = useState(false);
  const [showNoBallTypeModal, setShowNoBallTypeModal] = useState(false);
  const [showOutTypeModal, setShowOutTypeModal] = useState(false);
  const [outType, setOutType] = useState("");
  const [showRunOutSelectionModal, setShowRunOutSelectionModal] = useState(false);
  const [runOutRuns, setRunOutRuns] = useState(0);
  const [showInitialBatsmenModal, setShowInitialBatsmenModal] = useState(true);
  const [showInitialBowlerModal, setShowInitialBowlerModal] = useState(false);
  const [selectedInitialBatsmen, setSelectedInitialBatsmen] = useState([]);
  const [extraType, setExtraType] = useState(null);
  const [noBallType, setNoBallType] = useState(null);
  const [lastScored, setLastScored] = useState("");
  const [gameOver, setGameOver] = useState(false);
  const [allOut, setAllOut] = useState(false);
  const [boundaryType, setBoundaryType] = useState(null);
  const [showRunOutTypeModal, setShowRunOutTypeModal] = useState(false);
  const [showRunOutNoBallTypeModal, setShowRunOutNoBallTypeModal] = useState(false);
  const [showStumpOutTypeModal, setShowStumpOutTypeModal] = useState(false);
  const [currentOverEvents, setCurrentOverEvents] = useState([]);
  const [ballEvent, setBallEvent] = useState(null);
  const [initialPlayersSent, setInitialPlayersSent] = useState(false);
  const [tossWinningTeamName, setTossWinningTeamName] = useState(null);
  const sentRef = useRef(false);

  // ----- Persist State to localStorage -----
  useEffect(() => {
    // Load state from localStorage on mount
    const savedState = localStorage.getItem(`scoringState_${matchId}`);
    if (savedState) {
      const parsedState = JSON.parse(savedState);
      setInningNumber(parsedState.inningNumber || 1);
      setTargetScore(parsedState.targetScore || null);
      setBattingOrder(parsedState.battingOrder || []);
      setBowlingOrder(parsedState.bowlingOrder || []);
      setWinCondition(parsedState.winCondition || null);
      setRuns(parsedState.runs || 0);
      setWickets(parsedState.wickets || 0);
      setTotalDeliveries(parsedState.totalDeliveries || 0);
      setCurrentOverDeliveries(parsedState.currentOverDeliveries || 0);
      setAllBatsmen(
        parsedState.allBatsmen || [
          { id: 1, name: "Batsman1", runs: 0, balls: 0 },
          { id: 2, name: "Batsman2", runs: 0, balls: 0 },
          { id: 3, name: "Batsman3", runs: 0, balls: 0 },
          { id: 4, name: "Batsman4", runs: 0, balls: 0 },
          { id: 5, name: "Batsman5", runs: 0, balls: 0 },
          { id: 6, name: "Batsman6", runs: 0, balls: 0 },
          { id: 7, name: "Batsman7", runs: 0, balls: 0 },
          { id: 8, name: "Batsman8", runs: 0, balls: 0 },
          { id: 9, name: "Batsman9", runs: 0, balls: 0 },
          { id: 10, name: "Batsman10", runs: 0, balls: 0 },
          { id: 11, name: "Batsman11", runs: 0, balls: 0 },
        ]
      );
      setBatsmen(parsedState.batsmen || []);
      setOutBatsmen(parsedState.outBatsmen || []);
      setBattingTeamId(parsedState.battingTeamId || null);
      setBowlingTeamId(parsedState.bowlingTeamId || null);
      setBattingTeamName(parsedState.battingTeamName || null);
      setBowlingTeamName(parsedState.bowlingTeamName || null);
      setBowlers(
        parsedState.bowlers || [
          { id: 1, name: "Bowler1", deliveries: 0, runs: 0, wickets: 0 },
          { id: 2, name: "Bowler2", deliveries: 0, runs: 0, wickets: 0 },
        ]
      );
      setCurrentBowler(parsedState.currentBowler || 0);
      setPendingBowlerChange(parsedState.pendingBowlerChange || false);
      setShowBatsmanModal(parsedState.showBatsmanModal || false);
      setShowExtraModal(parsedState.showExtraModal || false);
      setShowNoBallTypeModal(parsedState.showNoBallTypeModal || false);
      setShowOutTypeModal(parsedState.showOutTypeModal || false);
      setOutType(parsedState.outType || "");
      setShowRunOutSelectionModal(parsedState.showRunOutSelectionModal || false);
      setRunOutRuns(parsedState.runOutRuns || 0);
      // Only show initial batsmen modal if no batsmen are selected
      setShowInitialBatsmenModal(
        parsedState.batsmen && parsedState.batsmen.length >= 2
          ? false
          : parsedState.showInitialBatsmenModal || true
      );
      // Only show initial bowler modal if batsmen are selected but initial players are not sent
      setShowInitialBowlerModal(
        parsedState.batsmen &&
          parsedState.batsmen.length >= 2 &&
          !parsedState.initialPlayersSent
          ? true
          : parsedState.showInitialBowlerModal || false
      );
      setSelectedInitialBatsmen(parsedState.selectedInitialBatsmen || []);
      setExtraType(parsedState.extraType || null);
      setNoBallType(parsedState.noBallType || null);
      setLastScored(parsedState.lastScored || "");
      setGameOver(parsedState.gameOver || false);
      setAllOut(parsedState.allOut || false);
      setBoundaryType(parsedState.boundaryType || null);
      setShowRunOutTypeModal(parsedState.showRunOutTypeModal || false);
      setShowRunOutNoBallTypeModal(parsedState.showRunOutNoBallTypeModal || false);
      setShowStumpOutTypeModal(parsedState.showStumpOutTypeModal || false);
      setCurrentOverEvents(parsedState.currentOverEvents || []);
      setBallEvent(parsedState.ballEvent || null);
      setInitialPlayersSent(parsedState.initialPlayersSent || false);
      setTossWinningTeamName(parsedState.tossWinningTeamName || null);
    }

    // Cleanup: Clear localStorage when component unmounts (navigating away)
    return () => {
      localStorage.removeItem(`scoringState_${matchId}`);
    };
  }, [matchId]);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    const stateToSave = {
      inningNumber,
      targetScore,
      battingOrder,
      bowlingOrder,
      winCondition,
      runs,
      wickets,
      totalDeliveries,
      currentOverDeliveries,
      allBatsmen,
      batsmen,
      outBatsmen,
      battingTeamId,
      bowlingTeamId,
      battingTeamName,
      bowlingTeamName,
      bowlers,
      currentBowler,
      pendingBowlerChange,
      showBatsmanModal,
      showExtraModal,
      showNoBallTypeModal,
      showOutTypeModal,
      outType,
      showRunOutSelectionModal,
      runOutRuns,
      showInitialBatsmenModal,
      showInitialBowlerModal,
      selectedInitialBatsmen,
      extraType,
      noBallType,
      lastScored,
      gameOver,
      allOut,
      boundaryType,
      showRunOutTypeModal,
      showRunOutNoBallTypeModal,
      showStumpOutTypeModal,
      currentOverEvents,
      ballEvent,
      initialPlayersSent,
      tossWinningTeamName,
    };
    localStorage.setItem(`scoringState_${matchId}`, JSON.stringify(stateToSave));
  }, [
    inningNumber,
    targetScore,
    battingOrder,
    bowlingOrder,
    winCondition,
    runs,
    wickets,
    totalDeliveries,
    currentOverDeliveries,
    allBatsmen,
    batsmen,
    outBatsmen,
    battingTeamId,
    bowlingTeamId,
    battingTeamName,
    bowlingTeamName,
    bowlers,
    currentBowler,
    pendingBowlerChange,
    showBatsmanModal,
    showExtraModal,
    showNoBallTypeModal,
    showOutTypeModal,
    outType,
    showRunOutSelectionModal,
    runOutRuns,
    showInitialBatsmenModal,
    showInitialBowlerModal,
    selectedInitialBatsmen,
    extraType,
    noBallType,
    lastScored,
    gameOver,
    allOut,
    boundaryType,
    showRunOutTypeModal,
    showRunOutNoBallTypeModal,
    showStumpOutTypeModal,
    currentOverEvents,
    ballEvent,
    initialPlayersSent,
    tossWinningTeamName,
    matchId,
  ]);
  // ----- useEffect Hooks -----
  useEffect(() => {
    if (matchId) {
      socket.emit("join-room", matchId);
      console.log("Joined room:", matchId);
    }
    return () => {
      socket.emit("leave-room", matchId);
    };
  }, [matchId]);

  useEffect(() => {
    if (inningNumber === 2 && gameOver && !sentRef.current) {
      sentRef.current = true;
      let winnerTeamId, winnerType;
      if (winCondition === "target") {
        winnerTeamId = battingTeamId;
        winnerType = `${battingTeamName} wins by ${10 - wickets} wickets`;
      } else {
        if (runs >= targetScore) {
          winnerTeamId = battingTeamId;
          winnerType = `${battingTeamName} wins by ${10 - wickets} wickets`;
        } else {
          winnerTeamId = bowlingTeamId;
          winnerType = `${bowlingTeamName} wins by ${targetScore - runs} runs`;
        }
      }
      socket.emit("matchEnd", {
        matchId,
        winnerTeamId,
        winnerType,
      });
    }
  }, [
    inningNumber,
    gameOver,
    winCondition,
    runs,
    wickets,
    targetScore,
    battingTeamName,
    bowlingTeamName,
    matchId,
    battingTeamId,
    bowlingTeamId,
  ]);

  useEffect(() => {
    if (
      batsmen.length === 2 &&
      bowlers[currentBowler] &&
      !showInitialBatsmenModal &&
      !showInitialBowlerModal &&
      !initialPlayersSent
    ) {
      const payload1 = {
        matchId,
        inningNumber,
        batsmanId: batsmen[0]?.id,
        teamId: battingTeamId,
        battingPosition: 1,
      };
      const payload2 = {
        matchId,
        inningNumber,
        batsmanId: batsmen[1]?.id,
        teamId: battingTeamId,
        battingPosition: 2,
      };
      const payload3 = {
        matchId,
        inningNumber,
        bowlerId: bowlers[currentBowler]?.id,
        teamId: bowlingTeamId,
        bowlingPosition: 1,
      };
      socket.emit("battingStats", payload1);
      socket.emit("battingStats", payload2);
      socket.emit("bowlingStats", payload3);
      console.log("Sent initial players:", payload1, payload2, payload3);
      setInitialPlayersSent(true);
    }
  }, [
    batsmen,
    bowlers,
    currentBowler,
    showInitialBatsmenModal,
    showInitialBowlerModal,
    initialPlayersSent,
    matchId,
    inningNumber,
    battingTeamId,
    bowlingTeamId,
  ]);

  useEffect(() => {
    if (ballEvent) {
      console.log("Emitting ballEvent:", ballEvent); // Debug ballEvent
      socket.emit("ballEvent", ballEvent);
      setBallEvent(null);
    }
  }, [ballEvent]);

  useEffect(() => {
    if (gameOver || allOut) {
      if (inningNumber === 1 && !targetScore) {
        setTargetScore(runs + 1);
      }
      const formattedOver = getFormattedOver(totalDeliveries);
      const [overNumberSent, ballNumberSent] = formattedOver.split('.').map(Number);
      const payload = {
        matchId,
        inningNumber,
        overNumber: overNumberSent,
        ballNumber: ballNumberSent,
        strikerId: batsmen[0]?.id,
        nonStrikerId: batsmen[1]?.id,
        bowlerId: bowlers[currentBowler]?.id,
        runScored: 0,
        isWicket: false,
        wicketType: null,
        newBatsmenId: null,
        boundaryType: null,
        extraRun: 0,
        extraType: null,
        currentStrikerId: batsmen[0]?.id,
        currentNonStrikerId: batsmen[1]?.id,
        totalRuns: runs,
        totalOversLimit,
        noBallType: null,
        gameOver: true,
        allOut,
      };
      socket.emit("inningOverEvent", payload);
      console.log("Inning Over Event Sent:", payload);
      const payload2 = {
        matchId,
      };
      if (inningNumber === 2) {
        socket.emit("gameOver", payload2);
      }
    }
  }, [
    gameOver,
    allOut,
    matchId,
    inningNumber,
    totalDeliveries,
    batsmen,
    bowlers,
    currentBowler,
    runs,
    totalOversLimit,
    targetScore,
  ]);

  useEffect(() => {
    const fetchPlayingSquad = async () => {
      try {
        const res = await fetch(`/api/matches/${matchId}/playingSquad`);
        const data = await res.json();
        console.log("Fetched data:", data);

        const { team1, team2, tossWinner, tossSelection } = data;

        let battingTeam, bowlingTeam;
        const tossWinningTeam = tossWinner === team1.teamId ? team1 : team2;
        const tossLosingTeam = tossWinner === team1.teamId ? team2 : team1;
        setTossWinningTeamName(tossWinningTeam.teamName);
        if (inningNumber === 1) {
          if (tossSelection === "bat") {
            battingTeam = tossWinningTeam;
            bowlingTeam = tossLosingTeam;
          } else {
            battingTeam = tossLosingTeam;
            bowlingTeam = tossWinningTeam;
          }
        } else {
          if (tossSelection === "bat") {
            battingTeam = tossLosingTeam;
            bowlingTeam = tossWinningTeam;
          } else {
            battingTeam = tossWinningTeam;
            bowlingTeam = tossLosingTeam;
          }
        }
        setBattingTeamId(battingTeam.teamId);
        setBowlingTeamId(bowlingTeam.teamId);
        setBattingTeamName(battingTeam.teamName);
        setBowlingTeamName(bowlingTeam.teamName);
        const battingPlayers = battingTeam.players.map((p, idx) => ({
          id: p.playerId,
          name: p.playerName,
          runs: 0,
          balls: 0,
          photo: p.photo,
        }));

        const bowlingPlayers = bowlingTeam.players.map((p, idx) => ({
          id: p.playerId,
          name: p.playerName,
          deliveries: 0,
          runs: 0,
          wickets: 0,
          photo: p.photo,
        }));

        setAllBatsmen(battingPlayers);
        setBowlers(bowlingPlayers);
      } catch (err) {
        console.error("Error fetching match:", err);
      }
    };

    fetchPlayingSquad();
  }, [matchId, inningNumber]);

  // ----- Helper Functions -----
  function getFormattedOver(totalDeliveries) {
    if (totalDeliveries === 0) return "0.0";
    const completedOvers = Math.floor(totalDeliveries / 6);
    const ballsInCurrentOver = totalDeliveries % 6;
    return ballsInCurrentOver === 0
      ? `${completedOvers - 1}.6`
      : `${completedOvers}.${ballsInCurrentOver}`;
  }
  
  const isGameOver = (legalDeliveries, currentRuns) => {
    if (inningNumber === 2 && targetScore && currentRuns >= targetScore) {
      return true;
    }
    return legalDeliveries >= totalOversLimit * 6;
  };

  const isTeamAllOut = () => {
    const availableBatsmen = allBatsmen.filter(
      (b) =>
        !batsmen.some((bt) => bt && bt.id === b.id) &&
        !outBatsmen.some((ob) => ob && ob.id === b.id)
    );
    return availableBatsmen.length === 0;
  };

  const resetCurrentOverEvents = () => {
    setCurrentOverEvents([]);
  };

  const addCurrentOverEvent = (event) => {
    if (event.toLowerCase().includes("out")) {
      setCurrentOverEvents((prev) => [...prev, "OUT"]);
    } else {
      setCurrentOverEvents((prev) => [...prev, event]);
    }
  };

  // ----- Ball Handling -----
  const handleRun = (run, bt = null) => {
    if (gameOver || allOut) return;

    const newTotalDeliveries = totalDeliveries + 1;
    const newCurrentOverDeliveries = currentOverDeliveries + 1;
    const newRuns = runs + run;

    const striker = batsmen[0];
    const nonStriker = batsmen[1];
    let updatedBatsmen = batsmen.map((batsman, index) =>
      index === 0
        ? { ...batsman, runs: batsman.runs + run, balls: batsman.balls + 1 }
        : batsman
    );

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

    setRuns(newRuns);
    setTotalDeliveries(newTotalDeliveries);
    setCurrentOverDeliveries(isOverCompleted ? 0 : newCurrentOverDeliveries);
    setBatsmen(updatedBatsmen);
    setBowlers(newBowlers);

    if (inningNumber === 2 && targetScore && newRuns >= targetScore) {
      setGameOver(true);
      setWinCondition("target");
      setLastScored(run.toString());
      addCurrentOverEvent(run.toString());

      const formattedOver = getFormattedOver(newTotalDeliveries);
      const [overNumberSent, ballNumberSent] = formattedOver.split('.').map(Number);

      setBallEvent({
        matchId,
        inningNumber,
        overNumber: overNumberSent,
        ballNumber: ballNumberSent,
        strikerId: striker?.id,
        outBatsmanId: null,
        nonStrikerId: nonStriker?.id,
        bowlerId: bowlers[currentBowler]?.id,
        runScored: run,
        isWicket: false,
        wicketType: null,
        newBatsmenId: null,
        boundaryType: bt,
        extraRun: 0,
        extraType: null,
        currentStrikerId: updatedBatsmen[0]?.id,
        currentNonStrikerId: updatedBatsmen[1]?.id,
        totalRuns: newRuns,
        totalOversLimit,
        noBallType: null,
        gameOver: true,
        allOut: false,
        currentOverEvents,
      });
      return;
    }

    setPendingBowlerChange(isOverCompleted && !isGameOver(newTotalDeliveries, newRuns));
    setGameOver(isGameOver(newTotalDeliveries, newRuns));
    setLastScored(run.toString());

    addCurrentOverEvent(run.toString());
    if (isOverCompleted) resetCurrentOverEvents();

    const formattedOver = getFormattedOver(newTotalDeliveries);
    const [overNumberSent, ballNumberSent] = formattedOver.split('.').map(Number);

    setBallEvent({
      matchId,
      inningNumber,
      overNumber: overNumberSent,
      ballNumber: ballNumberSent,
      strikerId: striker?.id,
      outBatsmanId: null,
      nonStrikerId: nonStriker?.id,
      bowlerId: bowlers[currentBowler]?.id,
      runScored: run,
      isWicket: false,
      wicketType: null,
      newBatsmenId: null,
      boundaryType: bt,
      extraRun: 0,
      extraType: null,
      currentStrikerId: updatedBatsmen[0]?.id,
      currentNonStrikerId: updatedBatsmen[1]?.id,
      totalRuns: newRuns,
      totalOversLimit,
      noBallType: null,
      gameOver: isGameOver(newTotalDeliveries, newRuns),
      allOut: false,
      currentOverEvents,
    });
  };

  const handleNonRunOutOut = (dismissalType) => {
    if (gameOver || allOut) return;

    const newTotalDeliveries = totalDeliveries + 1;
    const newCurrentOverDeliveries = currentOverDeliveries + 1;
    const outBatsman = batsmen[0];
    const nonStriker = batsmen[1];

    outBatsmanRef.current = outBatsman;
    previousNonStrikerRef.current = nonStriker;
    const newOutBatsmen = [...outBatsmen, outBatsman];
    const newBatsmen = [null, nonStriker];

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
    const allOutStatus = isTeamAllOut();
    const gameOverStatus = isGameOver(newTotalDeliveries, runs) || allOutStatus;

    setWickets((prev) => {
      const newWickets = prev + 1;
      if (newWickets === 10 && allOutStatus) {
        setAllOut(true);
        setGameOver(true);
        setShowBatsmanModal(false);
        setShowOutTypeModal(false);
      } else {
        setPendingBowlerChange(isOverCompleted && !gameOverStatus && !allOutStatus);
        setShowBatsmanModal(!allOutStatus);
        setShowOutTypeModal(false);
      }
      return newWickets;
    });
    setTotalDeliveries(newTotalDeliveries);
    setCurrentOverDeliveries(isOverCompleted ? 0 : newCurrentOverDeliveries);
    setBatsmen(newBatsmen);
    setOutBatsmen(newOutBatsmen);
    setBowlers(newBowlers);

    setAllOut(allOutStatus);
    setLastScored(dismissalType);
    setGameOver(gameOverStatus);

    addCurrentOverEvent("OUT");
    if (isOverCompleted) resetCurrentOverEvents();

    const formattedOver = getFormattedOver(newTotalDeliveries);
    const [overNumberSent, ballNumberSent] = formattedOver.split('.').map(Number);
    setBallEvent({
      matchId,
      inningNumber,
      overNumber: overNumberSent,
      ballNumber: ballNumberSent,
      strikerId: outBatsman?.id,
      outBatsmanId: outBatsman?.id,
      nonStrikerId: nonStriker?.id,
      bowlerId: bowlers[currentBowler]?.id,
      runScored: 0,
      isWicket: true,
      wicketType: dismissalType,
      newBatsmenId: null,
      boundaryType: null,
      extraRun: 0,
      extraType: null,
      currentStrikerId: null,
      currentNonStrikerId: nonStriker?.id,
      totalRuns: runs,
      totalOversLimit,
      noBallType: null,
      gameOver: gameOverStatus,
      allOut: allOutStatus,
      currentOverEvents,
    });
  };

  const handleRunOut = (selectedBatsman, runOutType, noBallSubType = null, selectedRuns = 0) => {
    if (gameOver || allOut) return;

    console.log("handleRunOut called with:", {
      selectedBatsman,
      runOutType,
      noBallSubType,
      selectedRuns,
    });

    let newTotalDeliveries = totalDeliveries;
    let newCurrentOverDeliveries = currentOverDeliveries;
    preRunoutStrikerRef.current = batsmen[0]?.id;
    preRunoutNonStrikerRef.current = batsmen[1]?.id;

    let newRuns = runs;
    let updatedBatsmen = [...batsmen];
    let newBowlers = [...bowlers];
    let extraRun = 0;
    let runScored = 0;
    let incrementDelivery = false;
    let swapBatsmen = false;

    // Apply run rules based on delivery type, aligned with handleExtraRuns
    if (runOutType === "Normal") {
      incrementDelivery = true;
      runScored = selectedRuns;
      updatedBatsmen = batsmen.map((batsman, index) =>
        index === 0
          ? { ...batsman, runs: batsman.runs + selectedRuns, balls: batsman.balls + 1 }
          : batsman
      );
      newRuns = runs + selectedRuns;
      newBowlers = bowlers.map((bowler, index) =>
        index === currentBowler
          ? {
              ...bowler,
              runs: bowler.runs + selectedRuns,
              wickets: bowler.wickets + 1,
              deliveries: incrementDelivery ? bowler.deliveries + 1 : bowler.deliveries,
            }
          : bowler
      );
      swapBatsmen = selectedRuns % 2 === 1;
      extraRun = 0;
    } else if (runOutType === "Wide") {
      newRuns = runs + 1 + selectedRuns;
      newBowlers = bowlers.map((bowler, index) =>
        index === currentBowler
          ? {
              ...bowler,
              runs: bowler.runs + 1 + selectedRuns,
              wickets: bowler.wickets + 1,
            }
          : bowler
      );
      extraRun = 1 + selectedRuns;
      swapBatsmen = selectedRuns % 2 === 1;
    } else if (runOutType === "NoBall") {
      newRuns = runs + 1 + selectedRuns;
      extraRun = 1 + selectedRuns;
      if (noBallSubType === "Off the Bat") {
        updatedBatsmen = batsmen.map((batsman, index) =>
          index === 0
            ? { ...batsman, runs: batsman.runs + selectedRuns }
            : batsman
        );
        newBowlers = bowlers.map((bowler, index) =>
          index === currentBowler
            ? {
                ...bowler,
                runs: bowler.runs + 1 + selectedRuns,
                wickets: bowler.wickets + 1,
              }
            : bowler
        );
      } else {
        newBowlers = bowlers.map((bowler, index) =>
          index === currentBowler
            ? {
                ...bowler,
                runs: bowler.runs + 1,
                wickets: bowler.wickets + 1,
              }
            : bowler
        );
      }
      swapBatsmen = selectedRuns % 2 === 1;
    } else if (runOutType === "Bye" || runOutType === "Leg Bye") {
      incrementDelivery = true;
      updatedBatsmen = batsmen.map((batsman, index) =>
        index === 0
          ? { ...batsman, balls: batsman.balls + 1 }
          : batsman
      );
      newRuns = runs + selectedRuns;
      newBowlers = bowlers.map((bowler, index) =>
        index === currentBowler
          ? {
              ...bowler,
              wickets: bowler.wickets + 1,
              deliveries: incrementDelivery ? bowler.deliveries + 1 : bowler.deliveries,
            }
          : bowler
      );
      extraRun = selectedRuns;
      swapBatsmen = selectedRuns % 2 === 1;
    }

    if (swapBatsmen) {
      updatedBatsmen = [updatedBatsmen[1], updatedBatsmen[0]];
    }

    // Apply out rules
    const newOutBatsmen = [...outBatsmen, selectedBatsman];
    const remainingBatsman =
      updatedBatsmen[0].id === selectedBatsman.id ? updatedBatsmen[1] : updatedBatsmen[0];
    const newBatsmen = [null, remainingBatsman];

    if (incrementDelivery) {
      newTotalDeliveries += 1;
      newCurrentOverDeliveries += 1;
    }

    const isOverCompleted = newCurrentOverDeliveries === 6;
    const allOutStatus = isTeamAllOut();
    const gameOverStatus = isGameOver(newTotalDeliveries, newRuns) || allOutStatus;

    setWickets((prev) => {
      const newWickets = prev + 1;
      if (newWickets === 10 && allOutStatus) {
        setAllOut(true);
        setGameOver(true);
      } else {
        setPendingBowlerChange(isOverCompleted && !gameOverStatus && !allOutStatus);
        setShowBatsmanModal(!allOutStatus);
      }
      return newWickets;
    });
    setRuns(newRuns);
    setTotalDeliveries(newTotalDeliveries);
    setCurrentOverDeliveries(isOverCompleted ? 0 : newCurrentOverDeliveries);
    setBatsmen(newBatsmen);
    setOutBatsmen(newOutBatsmen);
    setBowlers(newBowlers);
    setRunOutRuns(0);
    setExtraType(null);
    setNoBallType(null);
    setShowRunOutSelectionModal(false);
    setShowRunOutTypeModal(false);
    setShowRunOutNoBallTypeModal(false);
    setShowExtraModal(false);
    setShowOutTypeModal(false);

    setLastScored(
      runOutType === "Normal"
        ? `Run Out (${selectedRuns} run${selectedRuns === 1 ? "" : "s"} completed)`
        : runOutType === "Wide"
        ? `Run Out (Wide + ${selectedRuns} run${selectedRuns === 1 ? "" : "s"})`
        : runOutType === "NoBall"
        ? `Run Out (No Ball - ${noBallSubType || "Bye/Leg Bye"} + ${selectedRuns} run${selectedRuns === 1 ? "" : "s"})`
        : runOutType === "Bye"
        ? `Run Out (Bye - ${selectedRuns} run${selectedRuns === 1 ? "" : "s"} attempted)`
        : runOutType === "Leg Bye"
        ? `Run Out (Leg Bye - ${selectedRuns} run${selectedRuns === 1 ? "" : "s"} attempted)`
        : "Run Out"
    );

    addCurrentOverEvent("OUT");
    if (isOverCompleted) {
      resetCurrentOverEvents();
    }

    const formattedOver = getFormattedOver(newTotalDeliveries);
    const [overNumberSent, ballNumberSent] = formattedOver.split('.').map(Number);

    const ballEventPayload = {
      matchId,
      inningNumber,
      overNumber: overNumberSent,
      ballNumber: ballNumberSent,
      strikerId: preRunoutStrikerRef.current,
      outBatsmanId: selectedBatsman?.id,
      nonStrikerId: preRunoutNonStrikerRef.current,
      bowlerId: bowlers[currentBowler]?.id,
      runScored,
      isWicket: true,
      wicketType: "Run Out",
      newBatsmenId: null,
      boundaryType: null,
      extraRun,
      extraType: runOutType === "Normal" ? null : runOutType,
      currentStrikerId: null,
      currentNonStrikerId: remainingBatsman?.id,
      totalRuns: newRuns,
      totalOversLimit,
      noBallType: runOutType === "NoBall" ? noBallSubType : null,
      gameOver: gameOverStatus,
      allOut: allOutStatus,
      currentOverEvents,
    };

    console.log("Setting ballEvent:", ballEventPayload); // Debug ballEvent
    setBallEvent(ballEventPayload);
  };

  const handleOutButton = () => {
    if (gameOver || allOut) return;
    setShowOutTypeModal(true);
  };

  const handleOutTypeSelection = (type) => {
    console.log("Selected out type:", type); // Debug outType
    setOutType(type);
    setShowOutTypeModal(false);
    if (type === "Run Out") {
      setShowRunOutTypeModal(true);
    } else if (type === "Stumped") {
      setShowStumpOutTypeModal(true);
    } else {
      handleNonRunOutOut(type);
    }
  };

  const handleRunOutTypeSelection = (runOutType) => {
    console.log("Selected run out type:", runOutType); // Debug runOutType
    setExtraType(runOutType);
    setShowRunOutTypeModal(false);
    if (runOutType === "NoBall") {
      setShowRunOutNoBallTypeModal(true);
    } else {
      setShowExtraModal(true); // Open run selection for all types
    }
  };

  const handleRunOutNoBallTypeSelection = (noBallSubType) => {
    setNoBallType(noBallSubType);
    setShowRunOutNoBallTypeModal(false);
    setShowExtraModal(true); // Open run selection
  };

  const handleRunOutExtraRuns = (selectedRuns) => {
    setRunOutRuns(selectedRuns);
    setShowExtraModal(false);
    setShowRunOutSelectionModal(true);
  };

  const handleStumpOutTypeSelection = (isWide) => {
    if (gameOver || allOut) return;

    let newTotalDeliveries = totalDeliveries;
    let newCurrentOverDeliveries = currentOverDeliveries;
    const outBatsman = batsmen[0];
    const nonStriker = batsmen[1];

    outBatsmanRef.current = outBatsman;
    previousNonStrikerRef.current = nonStriker;
    stumpOutWide.current = isWide ? 1 : 0;

    const newOutBatsmen = [...outBatsmen, outBatsman];
    const newBatsmen = [null, nonStriker];

    let newRuns = runs;
    let newBowlers = bowlers;

    if (isWide) {
      newRuns = runs + 1;
      newBowlers = bowlers.map((bowler, index) =>
        index === currentBowler
          ? {
              ...bowler,
              runs: bowler.runs + 1,
              wickets: bowler.wickets + 1,
            }
          : bowler
      );
    } else {
      newTotalDeliveries = totalDeliveries + 1;
      newCurrentOverDeliveries = currentOverDeliveries + 1;
      newBowlers = bowlers.map((bowler, index) =>
        index === currentBowler
          ? {
              ...bowler,
              deliveries: bowler.deliveries + 1,
              wickets: bowler.wickets + 1,
            }
          : bowler
      );
    }

    const isOverCompleted = newCurrentOverDeliveries === 6;
    const allOutStatus = isTeamAllOut();
    const gameOverStatus = isGameOver(newTotalDeliveries, newRuns) || allOutStatus;

    setWickets((prev) => {
      const newWickets = prev + 1;
      if (newWickets === 10 && allOutStatus) {
        setAllOut(true);
        setGameOver(true);
        setShowBatsmanModal(false);
        setShowOutTypeModal(false);
        setShowExtraModal(false);
      } else {
        setPendingBowlerChange(isOverCompleted && !gameOverStatus && !allOutStatus);
        setShowBatsmanModal(!allOutStatus);
        setShowOutTypeModal(false);
        setShowExtraModal(false);
      }
      return newWickets;
    });
    setTotalDeliveries(newTotalDeliveries);
    setCurrentOverDeliveries(isOverCompleted ? 0 : newCurrentOverDeliveries);
    setBatsmen(newBatsmen);
    setOutBatsmen(newOutBatsmen);
    setBowlers(newBowlers);
    setRuns(newRuns);

    setAllOut(allOutStatus);
    setLastScored(isWide ? "Stumped (Wide)" : "Stumped");
    setGameOver(gameOverStatus);

    addCurrentOverEvent("OUT");
    if (isOverCompleted) {
      resetCurrentOverEvents();
    }

    const formattedOver = getFormattedOver(newTotalDeliveries);
    const [overNumberSent, ballNumberSent] = formattedOver.split('.').map(Number);

    setBallEvent({
      matchId,
      inningNumber,
      overNumber: overNumberSent,
      ballNumber: ballNumberSent,
      strikerId: outBatsman?.id,
      outBatsmanId: outBatsman?.id,
      nonStrikerId: nonStriker?.id,
      bowlerId: bowlers[currentBowler]?.id,
      runScored: 0,
      isWicket: true,
      wicketType: "Stumped",
      newBatsmenId: null,
      boundaryType: null,
      extraRun: isWide ? 1 : 0,
      extraType: isWide ? "Wide" : null,
      currentStrikerId: null,
      currentNonStrikerId: nonStriker?.id,
      totalRuns: newRuns,
      totalOversLimit,
      noBallType: null,
      gameOver: gameOverStatus,
      allOut: allOutStatus,
      currentOverEvents,
    });
  };

  const handleExtraRuns = (selectedRuns) => {
    if (gameOver || allOut) return;

    // Prevent handleExtraRuns from processing run-out flows
    if (outType === "Run Out") {
      handleRunOutExtraRuns(selectedRuns);
      return;
    }

    const preBallStrikerId = batsmen[0]?.id;
    const preBallNonStrikerId = batsmen[1]?.id;

    let runsToAdd = 0;
    let addToBowlerRuns = 0;
    let swapBatsmen = false;
    let updatedBatsmen = [...batsmen];
    let incrementDelivery = false;

    if (extraType === "Wide") {
      runsToAdd = 1 + selectedRuns;
      addToBowlerRuns = runsToAdd;
      swapBatsmen = selectedRuns % 2 === 1;
    } else if (extraType === "No Ball") {
      runsToAdd = 1 + selectedRuns;
      addToBowlerRuns = 1;
      swapBatsmen = selectedRuns % 2 === 1;
      if (noBallType === "bat") {
        updatedBatsmen = updatedBatsmen.map((batsman, index) =>
          index === 0 ? { ...batsman, runs: batsman.runs + selectedRuns } : batsman
        );
        addToBowlerRuns = selectedRuns + 1;
      }
    } else if (extraType === "Bye" || extraType === "Leg Bye") {
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

    const newRuns = runs + runsToAdd;
    const isOverCompleted = newCurrentOverDeliveries === 6;
    const gameOverStatus = isGameOver(newTotalDeliveries, newRuns);

    const newBowlers = bowlers.map((bowler, index) =>
      index === currentBowler
        ? {
            ...bowler,
            deliveries: incrementDelivery ? bowler.deliveries + 1 : bowler.deliveries,
            runs: bowler.runs + addToBowlerRuns,
          }
        : bowler
    );

    setRuns(newRuns);
    setTotalDeliveries(newTotalDeliveries);
    setCurrentOverDeliveries(isOverCompleted ? 0 : newCurrentOverDeliveries);
    setBatsmen(updatedBatsmen);
    setBowlers(newBowlers);
    setShowExtraModal(false);
    setShowOutTypeModal(false);
    setPendingBowlerChange(incrementDelivery && isOverCompleted && !gameOverStatus);
    setLastScored(
      extraType +
        (extraType === "No Ball" && noBallType ? ` (${noBallType})` : "") +
        " + " +
        runsToAdd +
        " runs"
    );
    setGameOver(gameOverStatus);

    const formattedOver = getFormattedOver(newTotalDeliveries);
    const [overNumberSent, ballNumberSent] = formattedOver.split('.').map(Number);

    addCurrentOverEvent(
      extraType === "No Ball" && noBallType === "bat" ? `No Ball${selectedRuns}` : extraType
    );

    if (isOverCompleted) {
      resetCurrentOverEvents();
    }
    setBallEvent({
      matchId,
      inningNumber,
      overNumber: overNumberSent,
      ballNumber: ballNumberSent,
      strikerId: preBallStrikerId,
      outBatsmanId: null,
      nonStrikerId: preBallNonStrikerId,
      bowlerId: bowlers[currentBowler]?.id,
      runScored: 0,
      isWicket: false,
      wicketType: null,
      newBatsmenId: null,
      boundaryType: null,
      extraRun: runsToAdd,
      extraType: extraType,
      currentStrikerId: updatedBatsmen[0]?.id,
      currentNonStrikerId: updatedBatsmen[1]?.id,
      totalRuns: newRuns,
      totalOversLimit,
      noBallType: extraType === "No Ball" ? noBallType : null,
      gameOver: gameOverStatus,
      allOut: false,
      currentOverEvents,
    });
    setExtraType(null);
  };

  const startSecondInnings = () => {
    setInningNumber(2);
    setRuns(0);
    setWickets(0);
    setTotalDeliveries(0);
    setCurrentOverDeliveries(0);
    setGameOver(false);
    setAllOut(false);
    setBatsmen([]);
    setOutBatsmen([]);
    setBowlers([
      { id: 1, name: "Bowler1", deliveries: 0, runs: 0, wickets: 0 },
      { id: 2, name: "Bowler2", deliveries: 0, runs: 0, wickets: 0 },
    ]);
    setPendingBowlerChange(false);
    setInitialPlayersSent(false);
    setSelectedInitialBatsmen([]);
    setShowInitialBatsmenModal(true);
    setCurrentBowler(0);
    setBowlingOrder([]);
    setWinCondition(null);
    resetCurrentOverEvents();
    console.log("Starting Second Innings. Target is", targetScore);
  };

  // ----- Batsman & Bowler Selection -----
  const handleSelectBatsman = (selectedBatsman) => {
    setBatsmen((prevBatsmen) => {
      const outBatsman = outBatsmanRef.current;
      const nonStriker = previousNonStrikerRef.current;
      const newBatsmen = [selectedBatsman, nonStriker];

      setBattingOrder((prevOrder) => {
        const updatedOrder = [...prevOrder, selectedBatsman.id];

        const isStumpWide = stumpOutWide.current === 1;
        const strikerBattingPosition = updatedOrder.indexOf(selectedBatsman.id) + 1;
        const formattedOver = getFormattedOver(totalDeliveries);
        const [overNumberSent, ballNumberSent] = formattedOver.split('.').map(Number);

        const payload = {
          matchId,
          inningNumber,
          overNumber: overNumberSent,
          ballNumber: ballNumberSent,
          outBatsmanId: outBatsman?.id,
          strikerId: outBatsman?.id,
          nonStrikerId: nonStriker?.id,
          bowlerId: bowlers[currentBowler]?.id,
          isWicket: false,
          wicketType: null,
          batsmanId: selectedBatsman?.id,
          boundaryType: null,
          extraRun: isStumpWide ? 1 : 0,
          extraType: isStumpWide ? "Wide" : null,
          currentStrikerId: selectedBatsman?.id,
          currentNonStrikerId: nonStriker?.id,
          totalRuns: runs,
          totalOversLimit,
          noBallType: null,
          gameOver,
          allOut,
          teamId: battingTeamId,
          battingPosition: strikerBattingPosition,
        };

        socket.emit("battingStats", payload);
        console.log("New batsman data sent:", payload);
        stumpOutWide.current = 0;

        return updatedOrder;
      });

      setShowBatsmanModal(false);
      setShowOutTypeModal(false);
      setShowExtraModal(false);
      setShowRunOutTypeModal(false);
      setShowRunOutNoBallTypeModal(false);
      setShowStumpOutTypeModal(false);
      setShowRunOutSelectionModal(false);
      setOutType(""); // Reset outType after batsman selection

      return newBatsmen;
    });
  };

  const handleSelectInitialBatsman = (batsman) => {
    setSelectedInitialBatsmen((prev) => {
      let selected = [...prev];
      if (!selected.find((b) => b.id === batsman.id)) {
        selected.push(batsman);
      }
      if (selected.length === 2) {
        setBatsmen(selected);
        setBattingOrder(selected.map((b) => b.id));
        setShowInitialBatsmenModal(false);
        setShowInitialBowlerModal(true);
      }
      return selected;
    });
  };

  const handleSelectInitialBowler = (index) => {
    const newBowler = bowlers[index];
    const updatedOrder = [...bowlingOrder, newBowler.id];
    setBowlingOrder(updatedOrder);
    setCurrentBowler(index);
    setShowInitialBowlerModal(false);

    const uniqueOrder = Array.from(new Set(updatedOrder));
    const bowlingPosition = uniqueOrder.indexOf(newBowler.id) + 1;

    socket.emit("bowlingStats", {
      matchId,
      inningNumber,
      bowlerId: newBowler.id,
      teamId: bowlingTeamId,
      bowlingPosition,
    });
    console.log("Sent initial bowler payload:", {
      matchId,
      inningNumber,
      bowlerId: newBowler.id,
      bowlingPosition,
    });
  };

  const handleSelectBowler = (index) => {
    const newBowler = bowlers[index];

    const updatedOrder = [...bowlingOrder, newBowler.id];
    setBowlingOrder(updatedOrder);

    const uniqueOrder = Array.from(new Set(updatedOrder));
    const bowlingPosition = uniqueOrder.indexOf(newBowler.id) + 1;

    setCurrentBowler(index);
    setPendingBowlerChange(false);

    const payload = {
      matchId,
      inningNumber,
      bowlerId: newBowler.id,
      teamId: bowlingTeamId,
      bowlingPosition,
      currentStrikerId: batsmen[0]?.id,
      currentNonStrikerId: batsmen[1]?.id,
    };
    socket.emit("bowlingStats", payload);
    console.log("Sent bowler change payload:", payload);
  };

  // ----- Derived values for display -----
  const totalOversDisplay =
    Math.floor(totalDeliveries / 6) + (totalDeliveries % 6) / 10;

  const currentBowlerData = bowlers[currentBowler] || { deliveries: 0, runs: 0, wickets: 0 };
  const bowlerOvers =
    Math.floor(currentBowlerData.deliveries / 6) +
    (currentBowlerData.deliveries % 6) / 10;

  const availableBatsmen = allBatsmen.filter(
    (b) =>
      !batsmen.some((bt) => bt && bt.id === b.id) &&
      !outBatsmen.some((ob) => ob && ob.id === b.id)
  );

  // ----- Main handleScore function -----
  const handleScore = (type, value, source = "custom") => {
    if (gameOver || allOut) return;
    if (type === "run") {
      const run = parseInt(value);
      if (source === "custom" && (isNaN(run) || run > 10 || run<0)) {
        alert("Custom runs cannot exceed 10!");
        return;
      }
      const bt = source === "button" && (run === 4 || run === 6) ? (run === 4 ? "Four" : "Six") : null;
      if (source === "button" && (run === 4 || run === 6)) {
        setBoundaryType(bt);
      } else {
        setBoundaryType(null);
      }
      handleRun(run, bt);
    } else if (type === "extra") {
      if (value === "No Ball") {
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
      <div className="scoring-main-div">
        <Header />
        <ScoreDisplay
          runs={runs}
          wickets={wickets}
          overs={totalOversDisplay}
          totalOvers={totalOversLimit}
          tossInfo={
            inningNumber === 1
              ? "Team A won the toss and elected to bat"
              : `Chasing Target: ${targetScore || 0} runs`
          }
        />
        {inningNumber === 1 && (gameOver || allOut) && (
          <div className="game-over">
            First Innings Over! <br />
            Final Score: {runs}/{wickets}
            <br />
            <button onClick={startSecondInnings}>Start Second Innings</button>
          </div>
        )}
        {inningNumber === 2 && targetScore && !gameOver && (
          <div className="target-info">
            <p>
              Need {targetScore - runs} runs in {totalOversLimit * 6 - totalDeliveries} balls
            </p>
          </div>
        )}
        {inningNumber === 2 && gameOver && winCondition === "target" && (
          <div className="game-over">
            Final Score: {runs}/{wickets} <br />
            {battingTeamName} won by {10 - wickets} wickets!
          </div>
        )}
        {inningNumber === 2 && gameOver && winCondition !== "target" && (
          <div className="game-over">
            Final Score: {runs}/{wickets} <br />
            Game Over: Maximum overs reached! <br />
            {runs >= targetScore
              ? `${battingTeamName} won by ${10 - wickets} wickets!`
              : `${bowlingTeamName} won by ${targetScore - runs} runs!`}
          </div>
        )}
        {allOut && (
          <div className="game-over">All Out: Team is all out! Inning Over!</div>
        )}

        <CurrentOverEvents events={currentOverEvents} />

        <div className="scoring-player-info">
          <PlayerInfo type="batsman" players={batsmen} teamName={battingTeamName} />
          <PlayerInfo
            type="bowler"
            player={{ ...currentBowlerData, overs: bowlerOvers, maidens: 0 }}
            teamName={bowlingTeamName}
          />
        </div>

        <ScoringButtons
          onScore={handleScore}
          lastScored={lastScored}
          disabled={gameOver || allOut}
        />

        {/* ------------- Modals ------------- */}
        {showNoBallTypeModal && (
          <Modal>
            <h3>No Ball: Runs off the bat or Bye/Leg Bye?</h3>
            <button
              onClick={() => {
                setShowNoBallTypeModal(false);
                setShowExtraModal(true);
                setNoBallType("bat");
                setExtraType("No Ball");
              }}
            >
              Off the Bat
            </button>
            <button
              onClick={() => {
                setShowNoBallTypeModal(false);
                setShowExtraModal(true);
                setNoBallType("Bye/Leg Bye");
                setExtraType("No Ball");
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
            <button onClick={() => handleOutTypeSelection("Bowled")}>Bowled</button>
            <button onClick={() => handleOutTypeSelection("Caught")}>Catch</button>
            <button onClick={() => handleOutTypeSelection("Stumped")}>Stump Out</button>
            <button onClick={() => handleOutTypeSelection("Hit Wicket")}>Hit Wicket</button>
            <button onClick={() => handleOutTypeSelection("handled the Ball")}>
              Handled the Ball
            </button>
            <button onClick={() => handleOutTypeSelection("LBW")}>LBW</button>
            <button onClick={() => handleOutTypeSelection("Run Out")}>Run Out</button>
          </Modal>
        )}

        {showRunOutSelectionModal && (
          <Modal>
            <h3>Select Batsman Who is Out</h3>
            {batsmen.map((batsman, index) => (
              <button
                key={index}
                onClick={() => handleRunOut(batsman, extraType, noBallType, runOutRuns)}
              >
                {batsman.name}
              </button>
            ))}
          </Modal>
        )}

        {showRunOutTypeModal && (
          <Modal>
            <h3>Run Out: Was it Normal, Wide, No Ball, Bye, or Leg Bye?</h3>
            <button onClick={() => handleRunOutTypeSelection("Normal")}>Normal</button>
            <button onClick={() => handleRunOutTypeSelection("Wide")}>Wide</button>
            <button onClick={() => handleRunOutTypeSelection("NoBall")}>No Ball</button>
            <button onClick={() => handleRunOutTypeSelection("Bye")}>Bye</button>
            <button onClick={() => handleRunOutTypeSelection("Leg Bye")}>Leg Bye</button>
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
                handleStumpOutTypeSelection(false);
              }}
            >
              Normal
            </button>
            <button
              onClick={() => {
                handleStumpOutTypeSelection(true);
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
                "Selected: " + selectedInitialBatsmen.map((b) => b.name).join(", ")}
            </p>
            {allBatsmen.map((batsman, index) => (
              <button
                key={index}
                onClick={() => handleSelectInitialBatsman(batsman)}
                disabled={selectedInitialBatsmen.find((b) => b.id === batsman.id)}
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
  <div className="scoring-header">
    <h1 className="scoring-heading">Start Scoring</h1>
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

const PlayerInfo = ({ type, players, player, teamName }) => {
  if (type === "batsman") {
    return (
      <div className="scoring-batsmen-info">
        <h3>{teamName}</h3>
        {players.map((batsman, index) =>
          batsman ? (
            <p key={index}>
              <span className="bat-icon" aria-hidden="true" />
              {batsman.name}: {batsman.runs} ({batsman.balls})
              {index === 0 ? " *" : ""}
            </p>
          ) : (
            <p key={index}>Waiting for new batsman...</p>
          )
        )}
      </div>
    );
  } else if (type === "bowler") {
    return (
      <div className="scoring-bowler-info">
        <h3>{teamName}</h3>
        <p>
          <span className="ball-icon" aria-hidden="true" />
          {player.name}: {player.overs}-{player.maidens}-{player.runs}-{player.wickets}
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
          value={customRun} min="0" max="10"
          onChange={(e) => setCustomRun(e.target.value)}
          style={{ width: "60px", height: "40px" }}
        />
        <button onClick={() => onScore("run", customRun)} disabled={disabled}>
          Submit Custom Run
        </button>
      </div>
      <div>
        <button onClick={() => onScore("extra", "Wide")} disabled={disabled}>
          Wide
        </button>
        <button onClick={() => onScore("extra", "No Ball")} disabled={disabled}>
          No Ball
        </button>
        <button onClick={() => onScore("extra", "Bye")} disabled={disabled}>
          Bye
        </button>
        <button onClick={() => onScore("extra", "Leg Bye")} disabled={disabled}>
          Leg Bye
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