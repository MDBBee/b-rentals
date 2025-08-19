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

  // [{from:_to:_}, {from:_to:_}...]
  const blockedPeriods = generateBlockedPeriods({
    bookings,
    today: currentDate,
  });

  // complex blocking due to default
  // {date:true, date:true...}
  const unavailableDates = generateDisabledDates(blockedPeriods);

  // 90d5c74a-7346-42a2-9b9e-ac15719851f4
  useEffect(() => {
    // ["date","date"....]
    const selectedRange = generateDateRange(range);

    const isDisabledDateIncluded = selectedRange.some((date) => {
      if (unavailableDates[date]) {
        setRange(defaultSelected);
        toast({
          description: 'Some dates are already booked. Please select again.',
          variant: 'destructive',
        });
        return true;
      }
      return false;
    });
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
