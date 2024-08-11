import React, { useState, useEffect } from 'react';
import { Student } from '../types';
import { useAppContext } from '../context/useAppContext';
import { addStudent, updateStudents } from '../context/AppActions';

interface StudentFormPopupProps {
  isOpen: boolean;
  onClose: () => void;
  studentToEdit?: Student;
  editIndex?: number;
}

export default function StudentFormPopup({ isOpen, onClose, studentToEdit, editIndex }: StudentFormPopupProps) {
  const { dispatch, students } = useAppContext();
  const [name, setName] = useState('');
  const [gender, setGender] = useState('');
  const [activityLevel, setActivityLevel] = useState('');

  useEffect(() => {
    if (studentToEdit) {
      setName(studentToEdit.name);
      setGender(studentToEdit.gender);
      setActivityLevel(studentToEdit.activityLevel);
    } else {
      resetForm();
    }
  }, [studentToEdit]);

  const resetForm = () => {
    setName('');
    setGender('');
    setActivityLevel('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const student: Student = { name, gender, activityLevel };

    if (editIndex !== undefined) {
      // Edit existing student
      const updatedStudents = [...students];
      updatedStudents[editIndex] = student;
      dispatch(updateStudents(updatedStudents));
    } else {
      // Add new student
      dispatch(addStudent(student));
    }

    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg w-96">
        <h2 className="text-xl font-bold mb-4">{studentToEdit ? 'Edit Student' : 'Add Student'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Student Name"
            className="border p-2 w-full rounded"
            required
          />
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            className="border p-2 w-full rounded"
            required
          >
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
          <select
            value={activityLevel}
            onChange={(e) => setActivityLevel(e.target.value)}
            className="border p-2 w-full rounded"
            required
          >
            <option value="">Select Activity Level</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <div className="flex justify-end space-x-2">
            <button type="button" onClick={onClose} className="bg-gray-300 text-black px-4 py-2 rounded">
              Cancel
            </button>
            <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">
              {studentToEdit ? 'Update' : 'Add'} Student
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
