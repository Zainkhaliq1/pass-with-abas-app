import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from './AuthContext';

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const { session } = useAuth();
  const instructorId = session?.user?.id;

  const [bookings, setBookings] = useState([]); // this instructor's bookings, with pupil + lesson info
  const [slots, setSlots] = useState([]); // this instructor's own availability (all statuses)
  const [pupils, setPupils] = useState([]); // full pupil roster (staff can see everyone)
  const [loading, setLoading] = useState(true);

  const loadBookings = useCallback(async () => {
    if (!instructorId) return;
    const { data, error } = await supabase
      .from('bookings')
      .select('*, pupils(name, phone, address, experience), availability_slots(date, time), lesson_types(label, duration)')
      .eq('instructor_id', instructorId)
      .order('date', { foreignTable: 'availability_slots' })
      .order('time', { foreignTable: 'availability_slots' });
    if (error) console.warn('Could not load bookings', error.message);
    setBookings((data || []).filter((b) => b.status !== 'cancelled'));
  }, [instructorId]);

  const loadSlots = useCallback(async () => {
    if (!instructorId) return;
    const { data, error } = await supabase
      .from('availability_slots')
      .select('*')
      .eq('instructor_id', instructorId)
      .order('date')
      .order('time');
    if (error) console.warn('Could not load your availability', error.message);
    setSlots(data || []);
  }, [instructorId]);

  const loadPupils = useCallback(async () => {
    const { data, error } = await supabase.from('pupils').select('*').order('name');
    if (error) console.warn('Could not load pupils', error.message);
    setPupils(data || []);
  }, []);

  const refreshAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([loadBookings(), loadSlots(), loadPupils()]);
    setLoading(false);
  }, [loadBookings, loadSlots, loadPupils]);

  useEffect(() => {
    if (instructorId) refreshAll();
  }, [instructorId, refreshAll]);

  // Live updates: a new booking against one of this instructor's slots
  // shows up immediately without a manual refresh.
  useEffect(() => {
    if (!instructorId) return;
    const channel = supabase
      .channel('instructor-bookings')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings', filter: `instructor_id=eq.${instructorId}` }, () => {
        loadBookings();
        loadSlots();
      })
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [instructorId, loadBookings, loadSlots]);

  const addSlot = useCallback(async (date, time) => {
    const { error } = await supabase.from('availability_slots').insert({ instructor_id: instructorId, date, time, status: 'open' });
    if (error) throw error;
    await loadSlots();
  }, [instructorId, loadSlots]);

  const removeSlot = useCallback(async (slotId) => {
    const { error } = await supabase.from('availability_slots').delete().eq('id', slotId).eq('status', 'open');
    if (error) throw error;
    await loadSlots();
  }, [loadSlots]);

  const cancelBooking = useCallback(async (bookingId) => {
    const { error } = await supabase.rpc('cancel_booking', { p_booking_id: bookingId });
    if (error) throw error;
    await Promise.all([loadBookings(), loadSlots()]);
  }, [loadBookings, loadSlots]);

  const markCompleted = useCallback(async (bookingId) => {
    const { error } = await supabase.from('bookings').update({ status: 'completed' }).eq('id', bookingId);
    if (error) throw error;
    await loadBookings();
  }, [loadBookings]);

  return (
    <DataContext.Provider
      value={{ bookings, slots, pupils, loading, addSlot, removeSlot, cancelBooking, markCompleted, refreshAll }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useInstructorData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useInstructorData must be used inside DataProvider');
  return ctx;
}
