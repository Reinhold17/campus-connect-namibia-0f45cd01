import { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { StatusBadge } from '@/components/StatusBadge';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/integrations/supabase/client';
import { Search, Bell, User, Calendar, MapPin, Clock, Upload, CheckCircle, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const sidebarItems = [
  { label: 'My Bookings', icon: Calendar, to: '/student' },
  { label: 'Browse Tutors', icon: Search, to: '/browse' },
  { label: 'Notifications', icon: Bell, to: '/student/notifications' },
  { label: 'Profile Settings', icon: User, to: '/student/profile' },
];

export default function StudentDashboard() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['student-bookings', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          sessions (
            *,
            tutor:profiles!sessions_tutor_id_fkey1 ( name )
          )
        `)
        .eq('student_id', user!.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const activeCount = bookings.filter(b => b.status !== 'cancelled' && b.status !== 'completed').length;
  const completedCount = bookings.filter(b => b.status === 'completed').length;
  const totalSpent = bookings
    .filter(b => b.payment_status === 'confirmed')
    .reduce((sum, b) => sum + (b.sessions?.price || 0), 0);

  return (
    <DashboardLayout title="Student Dashboard" items={sidebarItems}>
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border bg-card p-5 shadow-card">
            <p className="text-sm text-muted-foreground">Active Bookings</p>
            <p className="mt-1 font-display text-2xl font-bold">{activeCount}</p>
          </div>
          <div className="rounded-xl border bg-card p-5 shadow-card">
            <p className="text-sm text-muted-foreground">Completed Sessions</p>
            <p className="mt-1 font-display text-2xl font-bold">{completedCount}</p>
          </div>
          <div className="rounded-xl border bg-card p-5 shadow-card">
            <p className="text-sm text-muted-foreground">Total Spent</p>
            <p className="mt-1 font-display text-2xl font-bold">N${totalSpent}</p>
          </div>
        </div>

        {/* Bookings */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-bold">My Bookings</h2>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" asChild><Link to="/become-tutor">Become a Tutor</Link></Button>
              <Button size="sm" asChild><Link to="/browse">Browse Tutors</Link></Button>
            </div>
          </div>
          {isLoading ? (
            <p className="text-muted-foreground">Loading bookings...</p>
          ) : bookings.length === 0 ? (
            <div className="rounded-xl border bg-card p-8 text-center shadow-card">
              <p className="text-muted-foreground">No bookings yet.</p>
              <Button className="mt-4" asChild><Link to="/browse">Find a Tutor</Link></Button>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} userId={user!.id} queryClient={queryClient} />
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

function BookingCard({ booking, userId, queryClient }: { booking: any; userId: string; queryClient: any }) {
  const [uploadOpen, setUploadOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const session = booking.sessions;
  const tutorName = session?.tutor?.name || 'Unknown';
  const showLocation = booking.payment_status === 'confirmed';

  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!file) throw new Error('Select a file');
      const ext = file.name.split('.').pop();
      const path = `${userId}/${booking.id}.${ext}`;
      const { error: uploadErr } = await supabase.storage
        .from('payment-proofs')
        .upload(path, file, { upsert: true });
      if (uploadErr) throw uploadErr;

      const { error: updateErr } = await supabase
        .from('bookings')
        .update({ payment_status: 'uploaded', payment_proof_url: path })
        .eq('id', booking.id);
      if (updateErr) throw updateErr;
    },
    onSuccess: () => {
      toast.success('Payment proof uploaded! Waiting for admin confirmation.');
      setUploadOpen(false);
      setFile(null);
      queryClient.invalidateQueries({ queryKey: ['student-bookings'] });
    },
    onError: (err: any) => toast.error(err.message),
  });

  return (
    <div className="rounded-xl border bg-card p-5 shadow-card">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-display font-bold">{session?.subject || 'Session'}</h3>
            <StatusBadge status={booking.status} />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">with {tutorName}</p>
          <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
            {showLocation ? (
              <span className="flex items-center gap-1 text-success font-medium"><MapPin className="h-3 w-3" />{session?.location}</span>
            ) : (
              <span className="flex items-center gap-1 italic"><MapPin className="h-3 w-3" />Location revealed after payment</span>
            )}
            <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{session?.date}</span>
            <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{session?.time}</span>
          </div>
        </div>
        <div className="text-right space-y-1">
          <p className="font-display text-lg font-bold text-accent">N${session?.price || 0}</p>
          <PaymentStatusBadge status={booking.payment_status} />
          {booking.payment_status === 'pending' && (
            <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="mt-1 gap-1">
                  <Upload className="h-3 w-3" /> Upload Proof
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Upload Payment Proof</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Upload a screenshot or photo of your bank deposit slip for <strong>N${session?.price}</strong>.
                  </p>
                  <div>
                    <Label htmlFor="proof">Payment Proof Image</Label>
                    <Input
                      id="proof"
                      type="file"
                      accept="image/*"
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                    />
                  </div>
                  <Button
                    className="w-full"
                    disabled={!file || uploadMutation.isPending}
                    onClick={() => uploadMutation.mutate()}
                  >
                    {uploadMutation.isPending ? 'Uploading...' : 'Submit Payment Proof'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
          {booking.payment_status === 'uploaded' && (
            <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
              <CheckCircle className="h-3 w-3 text-warning" /> Awaiting confirmation
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function PaymentStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: 'bg-muted text-muted-foreground',
    uploaded: 'bg-warning/10 text-warning',
    confirmed: 'bg-success/10 text-success',
    rejected: 'bg-destructive/10 text-destructive',
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${styles[status] || styles.pending}`}>
      Payment: {status}
    </span>
  );
}
