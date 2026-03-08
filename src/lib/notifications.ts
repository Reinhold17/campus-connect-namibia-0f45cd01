import { supabase } from '@/integrations/supabase/client';

type NotificationType =
  | 'booking_confirmed'
  | 'payment_update'
  | 'session_reminder'
  | 'tutor_approved'
  | 'tutor_rejected';

interface SendNotificationParams {
  type: NotificationType;
  recipientUserId: string;
  data: Record<string, any>;
}

export async function sendNotification({ type, recipientUserId, data }: SendNotificationParams) {
  try {
    const { data: result, error } = await supabase.functions.invoke('send-notification', {
      body: { type, recipientUserId, data },
    });
    if (error) {
      console.error('Notification error:', error);
      return false;
    }
    return result?.success ?? false;
  } catch (e) {
    console.error('Failed to send notification:', e);
    return false;
  }
}
