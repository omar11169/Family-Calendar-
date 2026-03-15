import React, { useState, useEffect } from 'react';
import { auth, db, logOut, requestNotificationPermission, onMessageListener } from './firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { collection, query, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import Auth from './components/Auth';
import Calendar from './components/Calendar';
import { CalendarEvent } from './types';
import { LogOut, Bell, AlertTriangle } from 'lucide-react';

// ADD YOUR WIFE'S EMAIL HERE
const ALLOWED_EMAILS = [
  'balushi_scorpions@live.com',
  'wife.email@gmail.com' // <-- Replace with your wife's actual email
];

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [notificationToken, setNotificationToken] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        // Check if the user's email is in the allowed list
        if (currentUser.email && ALLOWED_EMAILS.includes(currentUser.email.toLowerCase())) {
          setUser(currentUser);
          setUnauthorized(false);
        } else {
          // If not allowed, log them out immediately
          await logOut();
          setUser(null);
          setUnauthorized(true);
        }
      } else {
        setUser(null);
        setUnauthorized(false);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, 'events'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const eventsData: CalendarEvent[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        eventsData.push({
          id: doc.id,
          title: data.title,
          date: data.date,
          category: data.category,
          description: data.description,
          createdBy: data.createdBy,
          createdAt: data.createdAt?.toMillis() || Date.now(),
        });
      });
      setEvents(eventsData);
    }, (error) => {
      console.error("Error fetching events:", error);
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (user) {
      // Setup push notifications
      requestNotificationPermission().then((token) => {
        if (token) setNotificationToken(token);
      });

      onMessageListener().then((payload: any) => {
        console.log("Received foreground message:", payload);
        if (payload?.notification) {
          alert(`${payload.notification.title}\n${payload.notification.body}`);
        }
      }).catch(err => console.log('failed: ', err));
    }
  }, [user]);

  const handleAddEvent = async (eventData: Omit<CalendarEvent, 'id' | 'createdBy' | 'createdAt'>) => {
    if (!user) return;
    try {
      await addDoc(collection(db, 'events'), {
        ...eventData,
        createdBy: user.uid,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error adding event:", error);
    }
  };

  const handleUpdateEvent = async (id: string, eventData: Partial<CalendarEvent>) => {
    if (!user) return;
    try {
      const eventRef = doc(db, 'events', id);
      await updateDoc(eventRef, eventData);
    } catch (error) {
      console.error("Error updating event:", error);
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'events', id));
    } catch (error) {
      console.error("Error deleting event:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (unauthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle size={32} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Access Denied</h1>
          <p className="text-slate-500 mb-8">
            Sorry, this calendar is private. Your email address is not authorized to view it.
          </p>
          <button
            onClick={() => setUnauthorized(false)}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-3 px-4 rounded-xl transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-safe">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 px-4 py-3 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center font-bold text-lg">
            F
          </div>
          <h1 className="text-xl font-bold tracking-tight">FamilyCal</h1>
        </div>
        <div className="flex items-center gap-2">
          {notificationToken ? (
            <div className="p-2 text-emerald-500" title="Notifications enabled">
              <Bell size={20} />
            </div>
          ) : (
            <button 
              onClick={() => requestNotificationPermission()}
              className="p-2 text-slate-400 hover:text-indigo-500 transition-colors"
              title="Enable notifications"
            >
              <Bell size={20} />
            </button>
          )}
          <button
            onClick={logOut}
            className="p-2 text-slate-400 hover:text-rose-500 transition-colors rounded-full hover:bg-slate-100"
            title="Sign out"
          >
            <LogOut size={20} />
          </button>
        </div>
      </header>

      <main className="pt-2">
        <Calendar
          events={events}
          onAddEvent={handleAddEvent}
          onUpdateEvent={handleUpdateEvent}
          onDeleteEvent={handleDeleteEvent}
        />
      </main>
    </div>
  );
}
