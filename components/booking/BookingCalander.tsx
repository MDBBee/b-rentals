'use client';
import { Calendar } from '@/components/ui/calendar';
import { useEffect, useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { DateRange } from 'react-day-picker';
import { useProperty } from '@/utils/store';

import {
  generateDisabledDates,
  generateDateRange,
  defaultSelected,
  generateBlockedPeriods,
} from '@/utils/calendar';

function BookingCalendar() {
  const currentDate = new Date();
  const [range, setRange] = useState<DateRange | undefined>(defaultSelected);
  const { toast } = useToast();

  // Normal blocking
  const bookings = useProperty((state) => state.bookings);
  const blockedPeriods = generateBlockedPeriods({
    bookings,
    today: currentDate,
  });
  // complex blocking due to default
  const unavailableDates = generateDisabledDates(blockedPeriods);
  useEffect(() => {
    const selectedRange = generateDateRange(range);
    useProperty.setState({ range });
  }, [range]);

  return (
    <Calendar
      mode="range"
      defaultMonth={currentDate}
      selected={range}
      onSelect={setRange}
      className="mb-4"
      disabled={blockedPeriods}
    />
  );
}

export default BookingCalendar;
