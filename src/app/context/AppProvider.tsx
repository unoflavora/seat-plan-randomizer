import React, { useReducer, ReactNode } from 'react';
import AppContext, { AppState } from './AppContext';
import appReducer from './AppReducer';

const initialState: AppState = {
  students: [],
  classroom: null,
  seatingPlan: [],
  seatingPlanHistory: [],
  historyIndex: -1,
  lastGeneratedPlan: [],
  canUndo: false,
  canRedo: false,
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ ...state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

