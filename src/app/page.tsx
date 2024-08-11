'use client';
import { useState } from 'react';
import ClassroomSetup from "./components/ClasroomSetup";
import SeatingPlan from "./components/SeatingPlan";
import StudentList from "./components/StudentList";
import StudentListPopup from "./components/StudentListPopup";
import { AppProvider } from './context/AppProvider';

export default function Home() {
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  return (
    <AppProvider>
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-center">Student Seating Plan Randomizer</h1>
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="w-full xl:w-1/3 hidden xl:block">
            <StudentList />
          </div>
          <div className="w-full xl:w-2/3 space-y-8">
            <ClassroomSetup />
            <SeatingPlan />
          </div>
        </div>
        <button
          className="sticky bottom-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-full shadow-lg xl:hidden"
          onClick={() => setIsPopupOpen(true)}
        >
          Student List
        </button>
        <StudentListPopup isOpen={isPopupOpen} onClose={() => setIsPopupOpen(false)} />
      </main>
    </AppProvider>
  );
}

