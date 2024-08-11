import React from 'react';
import { Student } from '../types';
import { useAppContext } from '../context/useAppContext';

const PrintableSeatingPlan: React.FC = () => {
  const { seatingPlan, classroom } = useAppContext();

  if (!classroom || seatingPlan.length === 0) {
    return null;
  }

  const renderSeat = (student: Student) => (
    <div className="border p-1 text-xs">
      <p className="font-bold">{student.name}</p>
      <p>{student.gender}</p>
      <p>{student.activityLevel}</p>
    </div>
  );

  const renderDesk = (deskStudents: Student[], rowIndex: number, deskIndex: number) => (
    <div key={`${rowIndex}-${deskIndex}`} className="border-2 p-1 flex">
      {deskStudents.map((student, seatIndex) => (
        <React.Fragment key={seatIndex}>
          {renderSeat(student)}
          {seatIndex < deskStudents.length - 1 && <div className="border-r mx-1" />}
        </React.Fragment>
      ))}
    </div>
  );

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Seating Plan</h1>
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${classroom.columns}, minmax(0, 1fr))` }}>
        {seatingPlan.map((row, rowIndex) => (
          <React.Fragment key={rowIndex}>
            {Array.from({ length: classroom.columns }, (_, colIndex) => {
              const startIndex = colIndex * classroom.seatsPerDesk;
              const deskStudents = row.slice(startIndex, startIndex + classroom.seatsPerDesk);
              return renderDesk(deskStudents, rowIndex, colIndex);
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default PrintableSeatingPlan;
