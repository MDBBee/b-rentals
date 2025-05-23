'use client';

import BookingContainer from './BookingContainer';
import BookingCalender from './BookingCalander';
import { Booking } from '@/utils/types';
import { useProperty } from '@/utils/store';
import { useEffect } from 'react';

type BookingWrapperProps = {
  propertyId: string;
  price: number;
  bookings: Booking[];
};

export default function BookingWrapper({
  propertyId,
  price,
  bookings,
}: BookingWrapperProps) {
  useEffect(() => {
    useProperty.setState({
      propertyId,
      price,
      bookings,
    });
  }, []);

  return (
    <>
      <BookingCalender />
      <BookingContainer />
    </>
  );
}
