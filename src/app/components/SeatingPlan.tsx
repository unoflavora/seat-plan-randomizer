import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Student } from '../types';
import PrintableSeatingPlan from './PrintableSeatingPlan';
import { useAppContext } from '../context/useAppContext';
import { generateSeatingPlan, moveStudent, redo, removePlan, resetToLastGenerated, undo } from '../context/AppActions';

export default function SeatingPlan() {
  const {
    students,
    seatingPlan,
    classroom,
    dispatch,
    canUndo,
    canRedo
  } = useAppContext();

  const [draggedOver, setDraggedOver] = useState<{ row: number; col: number } | null>(null);
  const draggedStudent = useRef<{ row: number; col: number; student: Student } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const lastTap = useRef<{ time: number; row: number; col: number } | null>(null);
  const [dragPreviewPosition, setDragPreviewPosition] = useState<{ x: number; y: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const autoScrollIntervalRef = useRef<number | null>(null);
  const [isPrinting, setIsPrinting] = useState(false);

  const handleGenerateSeatingPlan = () => {
    if (classroom) {
      dispatch(generateSeatingPlan(students, classroom));
    }
  };

  const handleRemovePlan = () => {
    dispatch(removePlan());
  };


  const handleTouchStart = useCallback((row: number, col: number, student: Student) => {
    const now = new Date().getTime();
    const DOUBLE_TAP_DELAY = 300; // ms

    if (lastTap.current &&
      now - lastTap.current.time < DOUBLE_TAP_DELAY &&
      lastTap.current.row === row &&
      lastTap.current.col === col) {
      // Double tap detected
      setIsDragging(true);
      draggedStudent.current = { row, col, student };
      setDragPreviewPosition({ x: 0, y: 0 }); // Initialize position
    } else {
      // Single tap
      lastTap.current = { time: now, row, col };
    }
  }, []);

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;

    e.preventDefault();
    const touch = e.touches[0];
    setDragPreviewPosition({ x: touch.clientX, y: touch.clientY });

    const element = document.elementFromPoint(touch.clientX, touch.clientY) as HTMLElement;
    if (element && element.dataset.row && element.dataset.col) {
      const row = parseInt(element.dataset.row);
      const col = parseInt(element.dataset.col);
      setDraggedOver({ row, col });
    }

    handleAutoScroll(touch.clientX, touch.clientY);
  };

  const handleDragLeave = () => {
    setDraggedOver(null);
  };

  const handleDragStart = (e: React.DragEvent, row: number, col: number, student: Student) => {
    console.log('Drag start', row, col, student);
    draggedStudent.current = { row, col, student };
    e.dataTransfer.setData('text/plain', JSON.stringify({ row, col }));
    setIsDragging(true);

    // Create and append drag preview image
    const dragPreview = createDragPreview(student);
    document.body.appendChild(dragPreview);
    e.dataTransfer.setDragImage(dragPreview, 30, 30);
    setTimeout(() => document.body.removeChild(dragPreview), 0);
  };

  const handleDragOver = (e: React.DragEvent, row: number, col: number) => {
    console.log('Drag over', row, col);
    e.preventDefault();
    setDraggedOver({ row, col });
    handleAutoScroll(e.clientX, e.clientY);
  };

  const handleDrop = useCallback((toRow: number, toCol: number) => {
    console.log('Drop', toRow, toCol);
    setDraggedOver(null);

    if (draggedStudent.current) {
      const { row: fromRow, col: fromCol } = draggedStudent.current;
      dispatch(moveStudent(fromRow, fromCol, toRow, toCol));
      draggedStudent.current = null;
    }

    setIsDragging(false);
    setDragPreviewPosition(null);
    stopAutoScroll();
  }, [dispatch]);



  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isDragging) return;

    e.preventDefault();
    if (draggedOver && draggedStudent.current) {
      handleDrop(draggedOver.row, draggedOver.col);
    }
    setDraggedOver(null);
    setIsDragging(false);
    setDragPreviewPosition(null);
    stopAutoScroll();
  };

  const handleAutoScroll = useCallback((clientX: number, clientY: number) => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    const scrollSpeed = 5;
    const scrollThreshold = 50; // pixels from edge to start scrolling

    let scrollX = 0;
    let scrollY = 0;

    if (clientX < rect.left + scrollThreshold) {
      scrollX = -scrollSpeed;
    } else if (clientX > rect.right - scrollThreshold) {
      scrollX = scrollSpeed;
    }

    if (clientY < rect.top + scrollThreshold) {
      scrollY = -scrollSpeed;
    } else if (clientY > rect.bottom - scrollThreshold) {
      scrollY = scrollSpeed;
    }

    if (scrollX !== 0 || scrollY !== 0) {
      startAutoScroll(scrollX, scrollY);
    } else {
      stopAutoScroll();
    }
  }, []);

  const startAutoScroll = (scrollX: number, scrollY: number) => {
    if (autoScrollIntervalRef.current) return;

    autoScrollIntervalRef.current = window.setInterval(() => {
      if (containerRef.current) {
        containerRef.current.scrollBy(scrollX, scrollY);
      }
    }, 16); // ~60fps
  };

  const stopAutoScroll = () => {
    if (autoScrollIntervalRef.current) {
      clearInterval(autoScrollIntervalRef.current);
      autoScrollIntervalRef.current = null;
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        setDragPreviewPosition({ x: e.clientX, y: e.clientY });
        handleAutoScroll(e.clientX, e.clientY);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', stopAutoScroll);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', stopAutoScroll);
      stopAutoScroll();
    };
  }, [handleAutoScroll, isDragging]);

  const createDragPreview = (student: Student) => {
    const div = document.createElement('div');
    div.className = 'bg-white border border-gray-300 rounded p-2 shadow-md';
    div.style.position = 'absolute';
    div.style.top = '-1000px';
    div.style.left = '-1000px';
    div.textContent = student.name;
    return div;
  };

  if (!classroom) {
    return <p>Please set up the classroom layout first.</p>;
  }

  const renderSeat = (student: Student, rowIndex: number, colIndex: number) => (
    <div
      key={`${rowIndex}-${colIndex}`}
      className={`flex-shrink-0 w-24 p-2 flex flex-col justify-between h-full cursor-move transition-colors duration-200
        ${draggedOver?.row === rowIndex && draggedOver?.col === colIndex ? 'bg-blue-100' : ''}
        ${isDragging && draggedStudent.current?.row === rowIndex && draggedStudent.current?.col === colIndex ? 'opacity-50' : ''}`}
      draggable={!('ontouchstart' in window)}
      data-row={rowIndex}
      data-col={colIndex}
      onDragStart={(e) => handleDragStart(e, rowIndex, colIndex, student)}
      onTouchStart={() => handleTouchStart(rowIndex, colIndex, student)}
      onDragOver={(e) => handleDragOver(e, rowIndex, colIndex)}
      onTouchMove={handleTouchMove}
      onDragLeave={handleDragLeave}
      onDrop={() => handleDrop(rowIndex, colIndex)}
      onTouchEnd={handleTouchEnd}
    >
      <p className="font-bold text-sm truncate" title={student.name}>{student.name}</p>
      <div>
        <p className="text-xs truncate" title={student.gender}>{student.gender}</p>
        <p className="text-xs truncate" title={student.activityLevel}>{student.activityLevel}</p>
      </div>
    </div>
  );

  const renderDesk = (deskStudents: Student[], rowIndex: number, deskIndex: number) => (
    <div
      key={deskIndex}
      className="border-2 border-gray-300 p-1 bg-white shadow-md rounded flex overflow-x-auto"
      style={{
        height: '120px',
        minWidth: '120px',
        maxWidth: '100%',
      }}
    >
      {deskStudents.map((student, seatIndex) => (
        <React.Fragment key={seatIndex}>
          {renderSeat(student, rowIndex, deskIndex * classroom.seatsPerDesk + seatIndex)}
          {seatIndex < deskStudents.length - 1 && (
            <div className="border-r border-gray-300 mx-1" />
          )}
        </React.Fragment>
      ))}
    </div>
  );


  const handlePrint = () => {
    setIsPrinting(true);
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 100);
  };

  return (
    <div className="mt-4">
      <h2 className="text-2xl font-bold mb-2">Seating Plan</h2>
      <div className="flex space-x-4 mb-4">
        <button
          onClick={handleGenerateSeatingPlan}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Generate New Seating Plan
        </button>
        <button
          onClick={handleRemovePlan}
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          Remove Plan
        </button>
        <button
          onClick={() => dispatch(undo())}
          disabled={!canUndo}
          className={`px-4 py-2 rounded ${canUndo ? 'bg-gray-500 text-white' : 'bg-gray-300 text-gray-500'}`}
        >
          Undo
        </button>
        <button
          onClick={() => dispatch(redo())}
          disabled={!canRedo}
          className={`px-4 py-2 rounded ${canRedo ? 'bg-gray-500 text-white' : 'bg-gray-300 text-gray-500'}`}
        >
          Redo
        </button>
        <button
          onClick={() => dispatch(resetToLastGenerated())}
          className="bg-yellow-500 text-white px-4 py-2 rounded"
        >
          Reset to Last Generated
        </button>
        <button
          onClick={handlePrint}
          className="bg-purple-500 text-white px-4 py-2 rounded"
        >
          Print Seating Plan
        </button>
      </div>
      {seatingPlan.length > 0 ? (
        <div ref={containerRef} className="overflow-auto max-h-[calc(100vh-300px)] p-4 border rounded">
          <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${classroom.columns}, minmax(120px, 1fr))` }}>
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
      ) : (
        <p>No seating plan generated yet. Click the button above to generate one.</p>
      )}
      {isDragging && dragPreviewPosition && draggedStudent.current && (
        <div
          className="fixed pointer-events-none bg-white border border-gray-300 rounded p-2 shadow-md"
          style={{
            left: dragPreviewPosition.x + 15,
            top: dragPreviewPosition.y + 15,
            zIndex: 1000,
          }}
        >
          {draggedStudent.current.student.name}
        </div>
      )}
      {isPrinting && (
        <div className="hidden print:block">
          <PrintableSeatingPlan />
        </div>
      )}
    </div>
  );
}

