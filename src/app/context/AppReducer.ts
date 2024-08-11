import { AppState } from './AppContext';
import { Student, Classroom } from '../types';

export type AppAction =
  | { type: 'ADD_STUDENT'; payload: Student }
  | { type: 'DELETE_STUDENT'; payload: number }
  | { type: 'UPDATE_STUDENTS'; payload: Student[] }
  | { type: 'SET_CLASSROOM'; payload: Classroom }
  | { type: 'SET_SEATING_PLAN'; payload: Student[][] }
  | { type: 'MOVE_STUDENT'; payload: { fromRow: number; fromCol: number; toRow: number; toCol: number } }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'RESET_TO_LAST_GENERATED' }
  | { type: 'ADD_STUDENTS_FROM_CSV'; payload: Student[] }
  | { type: 'REMOVE_PLAN' };

function appReducer(state: AppState, action: AppAction): AppState {
  let newState = reduce(state, action);
  newState.canUndo = newState.historyIndex > 0;
  newState.canRedo = newState.historyIndex < newState.seatingPlanHistory.length - 1;
  return newState
}
function reduce(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'ADD_STUDENT':
      return { ...state, students: [...state.students, action.payload] };
    case 'DELETE_STUDENT':
      return { ...state, students: state.students.filter((_, i) => i !== action.payload) };
    case 'UPDATE_STUDENTS':
      return { ...state, students: action.payload };
    case 'SET_CLASSROOM':
      return { ...state, classroom: action.payload };
    case 'SET_SEATING_PLAN':
      return {
        ...state,
        seatingPlan: action.payload,
        lastGeneratedPlan: action.payload,
        seatingPlanHistory: [action.payload],
        historyIndex: 0,
      };
    case 'MOVE_STUDENT':
      const newPlan = JSON.parse(JSON.stringify(state.seatingPlan));
      const { fromRow, fromCol, toRow, toCol } = action.payload;
      const temp = newPlan[fromRow][fromCol];
      newPlan[fromRow][fromCol] = newPlan[toRow][toCol];
      newPlan[toRow][toCol] = temp;
      const newHistory = state.seatingPlanHistory.slice(0, state.historyIndex + 1);
      newHistory.push(newPlan);
      return {
        ...state,
        seatingPlan: newPlan,
        seatingPlanHistory: newHistory,
        historyIndex: newHistory.length - 1,
      };
    case 'UNDO':
      if (state.historyIndex > 0) {
        return {
          ...state,
          historyIndex: state.historyIndex - 1,
          seatingPlan: state.seatingPlanHistory[state.historyIndex - 1],
        };
      }
      return state;
    case 'REDO':
      if (state.historyIndex < state.seatingPlanHistory.length - 1) {
        return {
          ...state,
          historyIndex: state.historyIndex + 1,
          seatingPlan: state.seatingPlanHistory[state.historyIndex + 1],
        };
      }
      return state;
    case 'RESET_TO_LAST_GENERATED':
      return {
        ...state,
        seatingPlan: state.lastGeneratedPlan,
        seatingPlanHistory: [state.lastGeneratedPlan],
        historyIndex: 0,
      };
    case 'ADD_STUDENTS_FROM_CSV':
      return { ...state, students: [...state.students, ...action.payload] };
    case 'REMOVE_PLAN':
      return {
        ...state,
        seatingPlan: [],
        seatingPlanHistory: [],
        historyIndex: -1,
        lastGeneratedPlan: [],
      };
    default:
      return state;
  }
}

export default appReducer;
