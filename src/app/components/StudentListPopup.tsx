import React from 'react';
import StudentList from './StudentList';

interface StudentListPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const StudentListPopup: React.FC<StudentListPopupProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex">
      <div className="relative p-8 bg-white w-full max-w-md m-auto flex-col flex rounded-lg">
        <button
          className="absolute top-0 right-0 mt-4 mr-4 text-black text-3xl leading-none"
          onClick={onClose}
        >
          &times;
        </button>
        <StudentList />
      </div>
    </div>
  );
};

export default StudentListPopup;
