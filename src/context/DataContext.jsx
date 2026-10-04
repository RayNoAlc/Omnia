import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import {
  fetchRoutine,
  fetchRoutineBlocks,
  fetchRoutineExceptions,
  fetchCommitments,
  fetchStudyBlocks,
  fetchNotes,
  fetchSummaries,
  fetchQuizAttempts,
  fetchProfessorAttempts,
  fetchSessions,
  fetchMaterials,
  fetchStudyGoals,
} from "../lib/db";

const DataContext = createContext();

export function DataProvider({ children }) {
  const { user } = useAuth();
  const [dataLoaded, setDataLoaded] = useState(false);

  // States
  const [routine, setRoutine] = useState(null);
  const [routineBlocks, setRoutineBlocks] = useState([]);
  const [routineExceptions, setRoutineExceptions] = useState([]);
  const [commitments, setCommitments] = useState([]);
  const [studyBlocks, setStudyBlocks] = useState([]);
  const [notes, setNotes] = useState([]);
  const [summaries, setSummaries] = useState({});
  const [quizAttempts, setQuizAttempts] = useState([]);
  const [professorAttempts, setProfessorAttempts] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [studyGoals, setStudyGoals] = useState([]);

  useEffect(() => {
    if (!user?.id) return;
    
    const loadAll = async () => {
      try {
        const [
          rData, rbData, reData, cData, sbData, nData,
          sData, qData, pData, sessData, mData, gData,
        ] = await Promise.all([
          fetchRoutine(user.id),
          fetchRoutineBlocks(user.id),
          fetchRoutineExceptions(user.id),
          fetchCommitments(user.id),
          fetchStudyBlocks(user.id),
          fetchNotes(user.id),
          fetchSummaries(user.id),
          fetchQuizAttempts(user.id),
          fetchProfessorAttempts(user.id),
          fetchSessions(user.id),
          fetchMaterials(user.id),
          fetchStudyGoals(user.id),
        ]);

        setRoutine(rData);
        setRoutineBlocks(rbData);
        setRoutineExceptions(reData);
        setCommitments(cData);
        setStudyBlocks(sbData);
        setNotes(nData);
        setSummaries(sData);
        setQuizAttempts(qData);
        setProfessorAttempts(pData);
        setSessions(sessData);
        setMaterials(mData);
        setStudyGoals(gData);
      } catch (error) {
        console.error("Error loading global data:", error);
      } finally {
        setDataLoaded(true);
      }
    };
    
    loadAll();
  }, [user]);

  // Expose state and setters
  const value = {
    dataLoaded,
    routine, setRoutine,
    routineBlocks, setRoutineBlocks,
    routineExceptions, setRoutineExceptions,
    commitments, setCommitments,
    studyBlocks, setStudyBlocks,
    notes, setNotes,
    summaries, setSummaries,
    quizAttempts, setQuizAttempts,
    professorAttempts, setProfessorAttempts,
    sessions, setSessions,
    materials, setMaterials,
    studyGoals, setStudyGoals,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  return useContext(DataContext);
}
