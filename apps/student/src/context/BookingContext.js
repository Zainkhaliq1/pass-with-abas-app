import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from './AuthContext';

const BookingContext = createContext(null);

export function BookingProvider({ children }) {
  const { session } = useAuth();
  const [instructors, setInstructors] = useState([]);
  const [lessonTypes, setLessonTypes] = useState([]);
  const [availability, setAvailability] = useState([]); // open slots, next ~14 days
  const [bookings, setBookings] = useState([]); // this pupil's own bookings
  const [loading, setLoading] = useState(true);

  const loadStaticData = useCallback(async () => {
    const [{ data: instructorRows, error: instructorErr }, { data: lessonRows, error: lessonErr }] = await Promise.all([
      supabase.from('instructors').select('*').order('name'),
      supabase.from('lesson_types').select('*').order('sort_order'),
    ]);
    if (instructorErr) console.warn('Could not load instructors', instructorErr.message);
    if (lessonErr) console.warn('Could not load lesson types', lessonErr.message);
    setInstructors(instructorRows || []);
    setLessonTypes(lessonRows || []);
  }, []);

  const loadAvailability = useCallback(async () => {
    const today = new Date().toISOString().slice(0, 10);
    const { data, error } = await supabase
      .from('availability_slots')
      .select('*')
      .eq('status', 'open')
      .gte('date', today)
      .order('date')
      .order('time');
    if (error) console.warn('Could not load availability', error.message);
    setAvailability(data || []);
  }, []);

  const loadMyBookings = useCallback(async () => {
    if (!session?.user?.id) {
      setBookings([]);
      return;
    }
    const { data, error } = await supabase
      .from('bookings')
      .select('*, availability_slots(date, time), instructors(name), lesson_types(label, duration)')
      .eq('pupil_id', session.user.id)
      .eq('status', 'confirmed')
      .order('created_at', { ascending: false });
    if (error) console.warn('Could not load bookings', error.message);
    setBookings(data || []);
  }, [session?.user?.id]);

  const refreshAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([loadStaticData(), loadAvailability(), loadMyBookings()]);
    setLoading(false);
  }, [loadStaticData, loadAvailability, loadMyBookings]);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  // Live updates: when any instructor adds/removes a slot, or any pupil
  // books one, everyone's availability list refreshes automatically.
  useEffect(() => {
    const channel = supabase
      .channel('availability-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'availability_slots' }, () => {
        loadAvailability();
      })
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [loadAvailability]);

  const bookSlot = useCallback(async (slot, lessonType) => {
    const { data, error } = await supabase.rpc('book_slot', {
      p_slot_id: slot.id,
      p_lesson_type_id: lessonType.id,
    });
    if (error) throw error;
    await Promise.all([loadAvailability(), loadMyBookings()]);
    return data;
  }, [loadAvailability, loadMyBookings]);

  const cancelBooking = useCallback(async (bookingId) => {
    const { error } = await supabase.rpc('cancel_booking', { p_booking_id: bookingId });
    if (error) throw error;
    await Promise.all([loadAvailability(), loadMyBookings()]);
  }, [loadAvailability, loadMyBookings]);

  return (
    <BookingContext.Provider
      value={{ instructors, lessonTypes, availability, bookings, loading, bookSlot, cancelBooking, refreshAll }}
    >
      {children}
    </BookingContext.Provider>
  );
}

export function useBookings() {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error('useBookings must be used inside BookingProvider');
  return ctx;
}
