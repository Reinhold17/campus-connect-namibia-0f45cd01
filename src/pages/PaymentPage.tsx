import { useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/integrations/supabase/client';
import { sendNotification } from '@/lib/notifications';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  CreditCard, Building2, Upload, CheckCircle, ArrowLeft, Loader2,
  Calendar, Clock, User, Copy, Shield
} from 'lucide-react';
import { toast } from 'sonner';
import { useQuery, useMutation } from '@tanstack/react-query';

export default function PaymentPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [paymentMethod, setPaymentMethod] = useState<'platform' | 'bank' | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [copied, setCopied] = useState(false);

  const { data: session, isLoading: sessionLoading } = useQuery({
    queryKey: ['payment-session', sessionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sessions')
        .select('*, tutor:profiles!sessions_tutor_id_fkey1 ( name, email ), module:modules!sessions_module_id_fkey ( name )')
        .eq('id', sessionId!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!sessionId,
  });

  const bankTransferMutation = useMutation({
    mutationFn: async () => {
      if (!file) throw new Error('Please upload proof of payment');
      if (!user || !sessionId) throw new Error('Missing data');

      // Create booking with pending_verification status
      const { data: booking, error: bookingErr } = await supabase
        .from('bookings')
        .insert({
          session_id: sessionId,
          student_id: user.id,
          status: 'pending_payment',
          payment_status: 'pending_verification',
        })
        .select('id')
        .single();
      if (bookingErr) throw bookingErr;

      // Upload proof
      const ext = file.name.split('.').pop();
      const path = `${user.id}/${booking.id}.${ext}`;
      const { error: uploadErr } = await supabase.storage
        .from('payment-proofs')
        .upload(path, file, { upsert: true });
      if (uploadErr) throw uploadErr;

      // Update booking with proof URL
      const { error: updateErr } = await supabase
        .from('bookings')
        .update({ payment_proof_url: path, payment_status: 'pending_verification' })
        .eq('id', booking.id);
      if (updateErr) throw updateErr;

      // Notify student
      await sendNotification({
        type: 'booking_confirmed',
        recipientUserId: user.id,
        data: {
          subject: session?.module?.name || session?.subject || 'Session',
          tutorName: session?.tutor?.name || 'Tutor',
          date: session?.date,
          time: session?.time,
        },
      });
    },
    onSuccess: () => {
      toast.success('Payment proof uploaded! Your booking is pending verification.');
      navigate('/student');
    },
    onError: (err: any) => toast.error(err.message),
  });

  const platformPayMutation = useMutation({
    mutationFn: async () => {
      if (!user || !sessionId) throw new Error('Missing data');

      // Create booking with confirmed status (platform payment is instant)
      const { error: bookingErr } = await supabase
        .from('bookings')
        .insert({
          session_id: sessionId,
          student_id: user.id,
          status: 'confirmed',
          payment_status: 'confirmed',
        });
      if (bookingErr) throw bookingErr;

      // Notify student
      await sendNotification({
        type: 'booking_confirmed',
        recipientUserId: user.id,
        data: {
          subject: session?.module?.name || session?.subject || 'Session',
          tutorName: session?.tutor?.name || 'Tutor',
          date: session?.date,
          time: session?.time,
        },
      });

      // Notify tutor
      if (session?.tutor_id) {
        await sendNotification({
          type: 'booking_confirmed',
          recipientUserId: session.tutor_id,
          data: {
            subject: session?.module?.name || session?.subject || 'Session',
            tutorName: 'You',
            date: session?.date,
            time: session?.time,
          },
        });
      }
    },
    onSuccess: () => {
      toast.success('Payment successful! Session confirmed.');
      navigate('/student');
    },
    onError: (err: any) => toast.error(err.message),
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  if (sessionLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <p className="text-muted-foreground">Session not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto max-w-3xl px-4 py-10">
        <Button variant="ghost" size="sm" className="mb-6 gap-1.5" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>

        {/* Session Summary */}
        <div className="rounded-xl border bg-card p-6 shadow-card">
          <h1 className="font-display text-2xl font-bold">Complete Your Booking</h1>
          <div className="mt-4 rounded-lg bg-muted/50 p-4">
            <h3 className="font-display font-bold text-lg">{session.module?.name || session.subject}</h3>
            <div className="mt-2 flex flex-wrap gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5"><User className="h-3.5 w-3.5" />{session.tutor?.name}</span>
              <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" />{session.date}</span>
              <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" />{session.time}</span>
            </div>
            <div className="mt-3">
              <Badge variant="secondary" className="text-base font-bold px-3 py-1">
                N${session.price}
              </Badge>
            </div>
          </div>
        </div>

        {/* Payment Method Selection */}
        <h2 className="mt-8 mb-4 font-display text-xl font-bold">Choose Payment Method</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Platform Payment */}
          <button
            onClick={() => setPaymentMethod('platform')}
            className={`rounded-xl border-2 p-5 text-left transition-all ${
              paymentMethod === 'platform'
                ? 'border-primary bg-primary/5 shadow-md'
                : 'border-border bg-card hover:border-primary/40 hover:shadow-card'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <CreditCard className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-display font-bold">Pay Through Platform</h3>
                <p className="text-xs text-muted-foreground">Secure online payment</p>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Shield className="h-3 w-3" /> Instant confirmation
            </div>
          </button>

          {/* Bank Transfer */}
          <button
            onClick={() => setPaymentMethod('bank')}
            className={`rounded-xl border-2 p-5 text-left transition-all ${
              paymentMethod === 'bank'
                ? 'border-primary bg-primary/5 shadow-md'
                : 'border-border bg-card hover:border-primary/40 hover:shadow-card'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/10">
                <Building2 className="h-5 w-5 text-secondary" />
              </div>
              <div>
                <h3 className="font-display font-bold">Bank Transfer</h3>
                <p className="text-xs text-muted-foreground">Manual bank deposit</p>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" /> Requires admin verification
            </div>
          </button>
        </div>

        {/* Platform Payment Form */}
        {paymentMethod === 'platform' && (
          <div className="mt-6 rounded-xl border bg-card p-6 shadow-card animate-fade-in">
            <h3 className="font-display text-lg font-bold mb-4">Platform Payment</h3>
            <div className="rounded-lg border-2 border-dashed border-warning/40 bg-warning/5 p-4 mb-4">
              <p className="text-sm text-warning font-medium">
                ⚠️ Online payment gateway coming soon. For now, please use Bank Transfer.
              </p>
            </div>
            <Button
              className="w-full"
              disabled={true}
            >
              Pay N${session.price} — Coming Soon
            </Button>
          </div>
        )}

        {/* Bank Transfer Form */}
        {paymentMethod === 'bank' && (
          <div className="mt-6 rounded-xl border bg-card p-6 shadow-card animate-fade-in space-y-5">
            <h3 className="font-display text-lg font-bold">Bank Transfer Details</h3>

            <div className="rounded-lg bg-muted/50 p-4 space-y-3">
              <BankDetailRow label="Bank Name" value="Bank Windhoek" onCopy={copyToClipboard} />
              <BankDetailRow label="Account Name" value="Campus Connect" onCopy={copyToClipboard} />
              <BankDetailRow label="Account Number" value="8004064256" onCopy={copyToClipboard} />
              <BankDetailRow label="Branch" value="Windhoek" onCopy={copyToClipboard} />
              <div className="pt-2 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Amount</span>
                  <span className="font-display text-lg font-bold text-primary">N${session.price}</span>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
              <p className="text-sm text-primary font-medium flex items-center gap-2">
                <Lightbulb className="h-4 w-4 shrink-0" /> Use your name as the payment reference so we can match your payment.
              </p>
            </div>

            <div>
              <Label htmlFor="proof" className="text-sm font-semibold">Upload Proof of Payment</Label>
              <p className="text-xs text-muted-foreground mb-2">Upload a screenshot, photo, or PDF of your bank deposit slip.</p>
              <Input
                id="proof"
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="cursor-pointer"
              />
              {file && (
                <p className="mt-2 flex items-center gap-1.5 text-xs text-success">
                  <CheckCircle className="h-3 w-3" /> {file.name} selected
                </p>
              )}
            </div>

            <Button
              className="w-full"
              disabled={!file || bankTransferMutation.isPending}
              onClick={() => bankTransferMutation.mutate()}
            >
              {bankTransferMutation.isPending ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</>
              ) : (
                <><Upload className="mr-2 h-4 w-4" /> Submit Booking & Payment Proof</>
              )}
            </Button>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}

function BankDetailRow({ label, value, onCopy }: { label: string; value: string; onCopy: (v: string) => void }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="font-medium text-sm">{value}</p>
      </div>
      <Button size="sm" variant="ghost" className="h-7 gap-1 text-xs" onClick={() => onCopy(value)}>
        <Copy className="h-3 w-3" /> Copy
      </Button>
    </div>
  );
}
