import React, { createContext, useCallback, useContext, useEffect, useReducer, useState } from "react";
import { api } from "../services/api";
import { StudentsAction, StudentsState, studentsReducer } from "./students-reducer";

interface StudentsContextValue {
  students: StudentsState;
  dispatch: React.Dispatch<StudentsAction>;
  isLoading: boolean;
  error: string | null;
  reloadStudents: () => void;
}

const StudentsContext = createContext<StudentsContextValue | null>(null);

export function StudentsProvider({ children }: { children: React.ReactNode }) {
  const [students, dispatch] = useReducer(studentsReducer, []);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const reloadStudents = useCallback(() => {
    setReloadKey((key) => key + 1);
  }, []);

  useEffect(() => {
    let active = true;

    setIsLoading(true);
    setError(null);

    api
      .get<StudentsState>("/students")
      .then(({ data }) => {
        if (active) {
          dispatch({ type: "LOAD", payload: data });
        }
      })
      .catch((err) => {
        if (active) {
          setError("Could not load students. Is the server running?");
        }
        console.error(err);
      })
      .finally(() => {
        if (active) {
          setIsLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [reloadKey]);

  return (
    <StudentsContext.Provider value={{ students, dispatch, isLoading, error, reloadStudents }}>
      {children}
    </StudentsContext.Provider>
  );
}

export function useStudents(): StudentsContextValue {
  const ctx = useContext(StudentsContext);
  if (!ctx) {
    throw new Error("useStudents must be used inside a StudentsProvider");
  }
  return ctx;
}
