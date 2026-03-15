import React, { useState } from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isSameMonth, isSameDay, addDays } from 'date-fns';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { CalendarEvent } from '../types';
import EventModal from './EventModal';

interface CalendarProps {
  events: CalendarEvent[];
  onAddEvent: (event: Omit<CalendarEvent, 'id' | 'createdBy' | 'createdAt'>) => void;
  onUpdateEvent: (id: string, event: Partial<CalendarEvent>) => void;
  onDeleteEvent: (id: string) => void;
}

const CATEGORY_COLORS = {
  'General Planning': 'bg-blue-100 text-blue-800 border-blue-200',
  'Schedules': 'bg-emerald-100 text-emerald-800 border-emerald-200',
  'Anniversaries': 'bg-rose-100 text-rose-800 border-rose-200',
  'Birthdays': 'bg-amber-100 text-amber-800 border-amber-200',
};

export default function Calendar({ events, onAddEvent, onUpdateEvent, onDeleteEvent }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);

  const renderHeader = () => {
    return (
      <div className="flex justify-between items-center mb-6 px-4 pt-6">
        <div className="flex flex-col">
          <span className="text-3xl font-bold text-slate-900 tracking-tight">
            {format(currentMonth, 'MMMM')}
          </span>
          <span className="text-lg font-medium text-slate-500">
            {format(currentMonth, 'yyyy')}
          </span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="p-2.5 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="p-2.5 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <ChevronRight size={24} />
          </button>
        </div>
      </div>
    );
  };

  const renderDays = () => {
    const days = [];
    const dateFormat = 'EEE';
    let startDate = startOfWeek(currentMonth);

    for (let i = 0; i < 7; i++) {
      days.push(
        <div className="text-center text-xs font-semibold text-slate-400 uppercase tracking-wider py-2" key={i}>
          {format(addDays(startDate, i), dateFormat)}
        </div>
      );
    }
    return <div className="grid grid-cols-7 mb-2 px-2">{days}</div>;
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const rows = [];
    let days = [];
    let day = startDate;
    let formattedDate = '';

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        formattedDate = format(day, 'd');
        const cloneDay = day;
        
        const dayEvents = events.filter(e => e.date === format(cloneDay, 'yyyy-MM-dd'));
        const isSelected = isSameDay(day, selectedDate);
        const isCurrentMonth = isSameMonth(day, monthStart);
        const isToday = isSameDay(day, new Date());

        days.push(
          <div
            className={`min-h-[100px] sm:min-h-[120px] p-1 sm:p-2 border-b border-r border-slate-100 relative transition-colors cursor-pointer ${
              !isCurrentMonth ? 'bg-slate-50/50 text-slate-400' : 'bg-white text-slate-700'
            } ${isSelected ? 'ring-2 ring-inset ring-indigo-500 z-10' : 'hover:bg-slate-50'}`}
            key={day.toString()}
            onClick={() => setSelectedDate(cloneDay)}
          >
            <div className="flex justify-between items-start">
              <span
                className={`flex items-center justify-center w-7 h-7 rounded-full text-sm font-medium ${
                  isToday
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : isSelected
                    ? 'bg-indigo-100 text-indigo-700'
                    : ''
                }`}
              >
                {formattedDate}
              </span>
              {dayEvents.length > 0 && (
                <span className="text-[10px] font-medium text-slate-400 sm:hidden">
                  {dayEvents.length}
                </span>
              )}
            </div>
            
            <div className="mt-1 flex flex-col gap-1 overflow-y-auto max-h-[60px] sm:max-h-[80px] no-scrollbar">
              {dayEvents.map((event) => (
                <div
                  key={event.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingEvent(event);
                    setSelectedDate(cloneDay);
                    setIsModalOpen(true);
                  }}
                  className={`text-[10px] sm:text-xs px-1.5 py-1 rounded border truncate font-medium ${CATEGORY_COLORS[event.category]}`}
                  title={event.title}
                >
                  {event.title}
                </div>
              ))}
            </div>
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div className="grid grid-cols-7" key={day.toString()}>
          {days}
        </div>
      );
      days = [];
    }
    return <div className="border-t border-l border-slate-100 bg-white rounded-2xl overflow-hidden shadow-sm mx-2 sm:mx-4 mb-24">{rows}</div>;
  };

  return (
    <div className="max-w-5xl mx-auto pb-20">
      {renderHeader()}
      {renderDays()}
      {renderCells()}

      {/* Floating Action Button for mobile */}
      <button
        onClick={() => {
          setEditingEvent(null);
          setIsModalOpen(true);
        }}
        className="fixed bottom-6 right-6 w-14 h-14 bg-indigo-600 text-white rounded-full shadow-lg shadow-indigo-200 flex items-center justify-center hover:bg-indigo-700 hover:scale-105 active:scale-95 transition-all z-40"
      >
        <Plus size={28} />
      </button>

      <EventModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedDate={selectedDate}
        existingEvent={editingEvent}
        onSave={(eventData) => {
          if (editingEvent) {
            onUpdateEvent(editingEvent.id, eventData);
          } else {
            onAddEvent(eventData);
          }
        }}
        onDelete={onDeleteEvent}
      />
    </div>
  );
}
