import { Student, Classroom } from '../types';
import { AppAction } from './AppReducer';

export const addStudent = (student: Student): AppAction => ({
  type: 'ADD_STUDENT',
  payload: student,
});

export const deleteStudent = (index: number): AppAction => ({
  type: 'DELETE_STUDENT',
  payload: index,
});

export const updateStudents = (students: Student[]): AppAction => ({
  type: 'UPDATE_STUDENTS',
  payload: students,
});

export const setClassroom = (classroom: Classroom): AppAction => ({
  type: 'SET_CLASSROOM',
  payload: classroom,
});

export const removePlan = (): AppAction => ({
  type: 'REMOVE_PLAN'
});

export const generateSeatingPlan = (students: Student[], classroom: Classroom | null): AppAction => {
  if (!classroom || students.length === 0) return { type: 'SET_SEATING_PLAN', payload: [] };

  // Separate students by gender and activity level
  const boys = students.filter(s => s.gender.toLowerCase() === 'male');
  const girls = students.filter(s => s.gender.toLowerCase() === 'female');
  const activeStudents = students.filter(s => s.activityLevel.toLowerCase() === 'high');
  const lessActiveStudents = students.filter(s => s.activityLevel.toLowerCase() !== 'high');

  // Shuffle each group
  const shuffleArray = (array: Student[]) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  };

  shuffleArray(boys);
  shuffleArray(girls);
  shuffleArray(activeStudents);
  shuffleArray(lessActiveStudents);

  const newSeatingPlan: Student[][] = [];
  const totalSeats = classroom.rows * classroom.columns * classroom.seatsPerDesk;
  const usedStudents = new Set<string>();

  for (let i = 0; i < classroom.rows; i++) {
    const row: Student[] = [];
    for (let j = 0; j < classroom.columns; j++) {
      const deskStudents: Student[] = [];
      for (let k = 0; k < classroom.seatsPerDesk; k++) {
        let student: Student | undefined;

        // Priority 1: Mix boys and girls
        if (k % 2 === 0) {
          student = boys.find(s => !usedStudents.has(s.name)) || girls.find(s => !usedStudents.has(s.name));
          if (student) {
            (k % 2 === 0 ? boys : girls) == (k % 2 === 0 ? boys : girls).filter(s => s.name !== student!.name);
          }
        } else {
          student = girls.find(s => !usedStudents.has(s.name)) || boys.find(s => !usedStudents.has(s.name));
          if (student) {
            (k % 2 === 0 ? girls : boys) == (k % 2 === 0 ? girls : boys).filter(s => s.name !== student!.name);
          }
        }

        // Priority 2: Mix active and less active students
        if (!student) {
          if (k % 2 === 0) {
            student = activeStudents.find(s => !usedStudents.has(s.name)) || lessActiveStudents.find(s => !usedStudents.has(s.name));
            if (student) {
              (k % 2 === 0 ? activeStudents : lessActiveStudents) == (k % 2 === 0 ? activeStudents : lessActiveStudents).filter(s => s.name !== student!.name);
            }
          } else {
            student = lessActiveStudents.find(s => !usedStudents.has(s.name)) || activeStudents.find(s => !usedStudents.has(s.name));
            if (student) {
              (k % 2 === 0 ? lessActiveStudents : activeStudents) == (k % 2 === 0 ? lessActiveStudents : activeStudents).filter(s => s.name !== student!.name);
            }
          }
        }

        // If still no student, use an empty seat
        if (!student) {
          student = { name: `Empty`, gender: '', activityLevel: '' };
        } else {
          usedStudents.add(student.name);
        }

        deskStudents.push(student);
      }
      row.push(...deskStudents);
    }
    newSeatingPlan.push(row);
  }

  return { type: 'SET_SEATING_PLAN', payload: newSeatingPlan };
};

export const moveStudent = (fromRow: number, fromCol: number, toRow: number, toCol: number): AppAction => ({
  type: 'MOVE_STUDENT',
  payload: { fromRow, fromCol, toRow, toCol },
});

export const undo = (): AppAction => ({ type: 'UNDO' });

export const redo = (): AppAction => ({ type: 'REDO' });

export const resetToLastGenerated = (): AppAction => ({ type: 'RESET_TO_LAST_GENERATED' });

export const addStudentsFromCSV = (newStudents: Student[]): AppAction => ({
  type: 'ADD_STUDENTS_FROM_CSV',
  payload: newStudents,
});
