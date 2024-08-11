import React, { useState } from 'react';
import { Student } from '../types';
import StudentFormPopup from './StudentFormPopup';
import CSVUpload from './UploadStudentCsv';
import { useAppContext } from '../context/useAppContext';
import { deleteStudent } from '../context/AppActions';

export default function StudentList() {
  const { students, dispatch } = useAppContext();
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<{ student: Student; index: number } | null>(null);

  const handleEdit = (student: Student, index: number) => {
    setEditingStudent({ student, index });
    setIsPopupOpen(true);
  };

  const handleClosePopup = () => {
    setIsPopupOpen(false);
    setEditingStudent(null);
  };

  return (
    <div className="bg-gray-100 p-4 rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Added Students ({students.length})</h2>
        <div className="flex flex-col gap-2">
          <button
            onClick={() => setIsPopupOpen(true)}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
          >
            Add Student
          </button>
          <CSVUpload />
        </div>
      </div>
      {students.length === 0 ? (
        <p>No students added yet.</p>
      ) : (
        <ul className="flex flex-col gap-2 max-h-[calc(10*2.5rem)] overflow-y-auto">
          {students.map((student: Student, index: number) => (
            <li key={index} className="bg-white p-2 rounded shadow flex justify-between items-start">
              <div>
                <p className="font-semibold">{student.name}</p>
                <p className="text-sm text-gray-600">
                  Gender: {student.gender}, Activity: {student.activityLevel}
                </p>

              </div>
              <div>
                <button
                  onClick={() => handleEdit(student, index)}
                  className="bg-blue-500 text-white px-2 py-1 rounded text-sm mr-2 hover:bg-blue-600 transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => dispatch(deleteStudent(index))}
                  className="bg-red-500 text-white px-2 py-1 rounded text-sm hover:bg-red-600 transition-colors"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
      <StudentFormPopup
        isOpen={isPopupOpen}
        onClose={handleClosePopup}
        studentToEdit={editingStudent?.student}
        editIndex={editingStudent?.index}
      />
    </div>
  );
}

