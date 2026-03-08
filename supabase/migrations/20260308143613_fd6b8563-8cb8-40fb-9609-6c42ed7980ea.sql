ALTER TABLE public.bookings DROP CONSTRAINT IF EXISTS bookings_payment_status_check;

ALTER TABLE public.bookings
ADD CONSTRAINT bookings_payment_status_check
CHECK (
  payment_status IN (
    'pending',
    'pending_payment',
    'uploaded',
    'pending_verification',
    'confirmed',
    'rejected',
    'cancelled'
  )
);