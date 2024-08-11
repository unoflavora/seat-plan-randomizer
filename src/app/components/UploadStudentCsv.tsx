import React, { useRef } from 'react';
import { Student } from '../types';
import { addStudentsFromCSV } from '../context/AppActions';
import { useAppContext } from '../context/useAppContext';

export default function CSVUpload() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { dispatch } = useAppContext();
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const csv = e.target?.result as string;
        const students = parseCSV(csv);
        dispatch(
          addStudentsFromCSV(students));
      };
      reader.readAsText(file);
    }
  };

  const parseCSV = (csv: string): Student[] => {
    const lines = csv.split('\n');
    const students: Student[] = [];

    for (let i = 1; i < lines.length; i++) { // Start from 1 to skip header
      const values = lines[i].split(',');
      if (values.length >= 3) {
        const name = values[0].trim();
        const gender = values[1].trim().toLowerCase();
        const activityLevel = values[2].trim().toLowerCase();

        students.push({
          name,
          gender,
          activityLevel
        });
      }
    }

    return students;
  };

  return (
    <div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept=".csv"
        style={{ display: 'none' }}
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
      >
        Upload CSV
      </button>
    </div>
  );
}

