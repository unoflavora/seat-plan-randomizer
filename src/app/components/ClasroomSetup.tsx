import React, { useState, CSSProperties } from 'react';
import { Classroom } from '../types';
import { setClassroom } from '../context/AppActions';
import { useAppContext } from '../context/useAppContext';

export default function ClassroomSetup() {
  const [rows, setRows] = useState('');
  const [columns, setColumns] = useState('');
  const [seatsPerDesk, setSeatsPerDesk] = useState('');
  const { dispatch } = useAppContext();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const classroom: Classroom = {
      rows: parseInt(rows) || 0,
      columns: parseInt(columns) || 0,
      seatsPerDesk: parseInt(seatsPerDesk) || 0
    };
    dispatch(setClassroom(classroom));
  };

  const handleInputChange = (
    setValue: React.Dispatch<React.SetStateAction<string>>
  ) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numberValue = parseInt(value);
    if (value === '' || (numberValue >= 0 && numberValue <= 99)) {
      setValue(value === '0' ? '' : value.replace(/^0+/, ''));
    }
  };

  const inputStyle: CSSProperties = {
    fontFamily: 'monospace',
    lineHeight: '1.5',
    appearance: 'textfield',
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="rows" className="block text-sm font-medium text-gray-700 mb-1">Number of Rows</label>
          <input
            id="rows"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={rows}
            onChange={handleInputChange(setRows)}
            className="w-full border border-gray-300 rounded-md shadow-sm p-2"
            style={inputStyle}
          />
        </div>
        <div>
          <label htmlFor="columns" className="block text-sm font-medium text-gray-700 mb-1">Number of Columns</label>
          <input
            id="columns"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={columns}
            onChange={handleInputChange(setColumns)}
            className="w-full border border-gray-300 rounded-md shadow-sm p-2"
            style={inputStyle}
          />
        </div>
        <div>
          <label htmlFor="seatsPerDesk" className="block text-sm font-medium text-gray-700 mb-1">Seats per Desk</label>
          <input
            id="seatsPerDesk"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={seatsPerDesk}
            onChange={handleInputChange(setSeatsPerDesk)}
            className="w-full border border-gray-300 rounded-md shadow-sm p-2"
            style={inputStyle}
          />
        </div>
      </div>
      <button type="submit" className="w-full md:w-auto bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 transition-colors">
        Set Classroom Layout
      </button>
    </form>
  );
}

