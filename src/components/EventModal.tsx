import React, { useState, useEffect } from 'react';
import { X, Calendar as CalendarIcon, Tag, AlignLeft } from 'lucide-react';
import { CalendarEvent, EventCategory } from '../types';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: Omit<CalendarEvent, 'id' | 'createdBy' | 'createdAt'>) => void;
  onDelete?: (id: string) => void;
  selectedDate: Date;
  existingEvent?: CalendarEvent | null;
}

const CATEGORIES: { name: EventCategory; color: string }[] = [
  { name: 'General Planning', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  { name: 'Schedules', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  { name: 'Anniversaries', color: 'bg-rose-100 text-rose-800 border-rose-200' },
  { name: 'Birthdays', color: 'bg-amber-100 text-amber-800 border-amber-200' },
];

export default function EventModal({ isOpen, onClose, onSave, onDelete, selectedDate, existingEvent }: EventModalProps) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<EventCategory>('General Planning');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (existingEvent) {
      setTitle(existingEvent.title);
      setCategory(existingEvent.category);
      setDescription(existingEvent.description || '');
    } else {
      setTitle('');
      setCategory('General Planning');
      setDescription('');
    }
  }, [existingEvent, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    
    onSave({
      title: title.trim(),
      date: selectedDate.toISOString().split('T')[0],
      category,
      description: description.trim()
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4 sm:p-0">
      <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-900">
            {existingEvent ? 'Edit Event' : 'New Event'}
          </h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <input
              type="text"
              placeholder="Event Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-xl font-medium text-slate-900 placeholder:text-slate-400 border-0 border-b-2 border-transparent hover:border-slate-200 focus:border-indigo-500 focus:ring-0 px-0 py-2 transition-colors bg-transparent"
              autoFocus
            />
          </div>

          <div className="flex items-center gap-3 text-slate-600">
            <CalendarIcon size={18} className="text-slate-400" />
            <span className="font-medium">{selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-3 text-slate-600 mb-2">
              <Tag size={18} className="text-slate-400" />
              <span className="text-sm font-medium">Category</span>
            </div>
            <div className="grid grid-cols-2 gap-2 pl-7">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.name}
                  type="button"
                  onClick={() => setCategory(cat.name)}
                  className={`text-xs font-medium px-3 py-2 rounded-lg border text-left transition-all ${
                    category === cat.name 
                      ? 'ring-2 ring-indigo-500 ring-offset-1 ' + cat.color
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-start gap-3 text-slate-600 pt-2">
            <AlignLeft size={18} className="text-slate-400 mt-2.5" />
            <textarea
              placeholder="Add description or notes..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-sm text-slate-700 placeholder:text-slate-400 border-0 bg-slate-50 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 min-h-[100px] resize-none"
            />
          </div>

          <div className="flex gap-3 pt-4 border-t border-slate-100 mt-6">
            {existingEvent && onDelete && (
              <button
                type="button"
                onClick={() => {
                  onDelete(existingEvent.id);
                  onClose();
                }}
                className="flex-1 bg-rose-50 text-rose-600 hover:bg-rose-100 font-medium py-3 rounded-xl transition-colors"
              >
                Delete
              </button>
            )}
            <button
              type="submit"
              disabled={!title.trim()}
              className="flex-[2] bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium py-3 rounded-xl transition-colors shadow-sm"
            >
              Save Event
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
