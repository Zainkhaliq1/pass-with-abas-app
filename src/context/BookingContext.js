import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { generateAvailability } from '../data/mockData';

const STORAGE_KEY = 'pwa_bookings_v1';
const BookingContext = createContext(null);

export function BookingProvider({ children }) {
  const [bookings, setBookings] = useState([]);
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setAvailability(generateAvailability(14));
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) setBookings(JSON.parse(raw));
      } catch (e) {
        // If storage fails, the app still works for the session.
        console.warn('Could not load saved bookings', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const persist = useCallback(async (next) => {
    setBookings(next);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch (e) {
      console.warn('Could not save bookings', e);
    }
  }, []);

  const bookSlot = useCallback(
    (slot, lessonType, instructor) => {
      const newBooking = {
        id: `bk-${Date.now()}`,
        slotId: slot.id,
        instructorId: instructor.id,
        instructorName: instructor.name,
        date: slot.date,
        time: slot.time,
        lessonTypeId: lessonType.id,
        lessonLabel: lessonType.label,
        price: lessonType.price,
        status: 'confirmed',
        createdAt: new Date().toISOString(),
      };
      const next = [newBooking, ...bookings];
      persist(next);
      // Remove the slot from availability so it can't be double-booked.
      setAvailability((prev) => prev.filter((s) => s.id !== slot.id));
      return newBooking;
    },
    [bookings, persist]
  );

  const cancelBooking = useCallback(
    (bookingId) => {
      const target = bookings.find((b) => b.id === bookingId);
      const next = bookings.filter((b) => b.id !== bookingId);
      persist(next);
      if (target) {
        setAvailability((prev) => [
          ...prev,
          { id: target.slotId, instructorId: target.instructorId, date: target.date, time: target.time },
        ]);
      }
    },
    [bookings, persist]
  );

  const isSlotTaken = useCallback((slotId) => !availability.some((s) => s.id === slotId), [availability]);

  return (
    <BookingContext.Provider
      value={{ bookings, availability, loading, bookSlot, cancelBooking, isSlotTaken }}
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
