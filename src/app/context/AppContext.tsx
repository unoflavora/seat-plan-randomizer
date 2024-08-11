
import { createContext } from 'react';
import { Student, Classroom } from '../types';
import { AppAction } from './AppReducer';

export interface AppState {
  students: Student[];
  classroom: Classroom | null;
  seatingPlan: Student[][];
  seatingPlanHistory: Student[][][];
  historyIndex: number;
  lastGeneratedPlan: Student[][];
  canUndo: boolean;
  canRedo: boolean;
}

export interface AppContextType extends AppState {
  dispatch: React.Dispatch<AppAction>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export default AppContext;

