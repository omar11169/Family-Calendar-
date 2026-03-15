export type EventCategory = 'General Planning' | 'Schedules' | 'Anniversaries' | 'Birthdays';

export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  category: EventCategory;
  description?: string;
  createdBy: string;
  createdAt: number;
}
