import { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { StatusBadge } from '@/components/StatusBadge';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/integrations/supabase/client';
import { Search, Bell, User, Calendar, Clock, Upload, CheckCircle, MessageCircle, Edit, Sparkles } from 'lucide-react';
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
  { label: 'AI Study Planner', icon: Sparkles, to: '/student/study-planner' },
  { label: 'Profile Settings', icon: User, to: '/student/profile' },
];

export default function StudentDashboard() {
  const { user, profile } = useAuth();
  const queryClient = useQueryClient();
  const [editOpen, setEditOpen] = useState(false);

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['student-bookings', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          sessions (
            *,
            tutor:profiles!sessions_tutor_id_fkey1 ( name ),
            module:modules!sessions_module_id_fkey ( name, whatsapp_group_url )
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

  return (
    <DashboardLayout title="Student Dashboard" items={sidebarItems}>
      <div className="space-y-6">
        {/* Profile Summary */}
        <ProfileSection profile={profile} editOpen={editOpen} setEditOpen={setEditOpen} userId={user?.id} queryClient={queryClient} />

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border bg-card p-5 shadow-card">
            <p className="text-sm text-muted-foreground">Active Bookings</p>
            <p className="mt-1 font-display text-2xl font-bold">{activeCount}</p>
          </div>
          <div className="rounded-xl border bg-card p-5 shadow-card">
            <p className="text-sm text-muted-foreground">Completed Sessions</p>
            <p className="mt-1 font-display text-2xl font-bold">{completedCount}</p>
          </div>
        </div>

        {/* Bookings */}
        <div>
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="font-display text-lg font-bold">My Bookings</h2>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" asChild className="flex-1 sm:flex-none"><Link to="/become-tutor">Become a Tutor</Link></Button>
              <Button size="sm" asChild className="flex-1 sm:flex-none"><Link to="/browse">Browse Tutors</Link></Button>
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

function ProfileSection({ profile, editOpen, setEditOpen, userId, queryClient }: any) {
  const [name, setName] = useState(profile?.name || '');
  const [email, setEmail] = useState(profile?.email || '');
  const [phone, setPhone] = useState(profile?.phone_number || '');

  const updateMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('profiles')
        .update({ name, email, phone_number: phone })
        .eq('user_id', userId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Profile updated!');
      setEditOpen(false);
      queryClient.invalidateQueries({ queryKey: ['student-bookings'] });
    },
    onError: (err: any) => toast.error(err.message),
  });

  return (
    <div className="rounded-xl border bg-card p-5 shadow-card">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display font-bold">{profile?.name || 'Student'}</h3>
          <p className="text-sm text-muted-foreground">{profile?.email}</p>
          {profile?.phone_number && <p className="text-sm text-muted-foreground">{profile.phone_number}</p>}
        </div>
        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline" className="gap-1" onClick={() => { setName(profile?.name || ''); setEmail(profile?.email || ''); setPhone(profile?.phone_number || ''); }}>
              <Edit className="h-3 w-3" /> Edit Profile
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Edit Profile</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>Name</Label><Input value={name} onChange={e => setName(e.target.value)} /></div>
              <div><Label>Email</Label><Input value={email} onChange={e => setEmail(e.target.value)} type="email" /></div>
              <div><Label>Phone Number</Label><Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+264..." /></div>
              <Button className="w-full" onClick={() => updateMutation.mutate()} disabled={updateMutation.isPending}>
                {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

function BookingCard({ booking, userId, queryClient }: { booking: any; userId: string; queryClient: any }) {
  const [uploadOpen, setUploadOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const session = booking.sessions;
  const tutorName = session?.tutor?.name || 'Unknown';
  const moduleName = session?.module?.name || session?.subject || 'Session';
  const whatsappUrl = session?.module?.whatsapp_group_url;
  const paymentConfirmed = booking.payment_status === 'confirmed';

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
            <h3 className="font-display font-bold">{moduleName}</h3>
            <StatusBadge status={booking.status} />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">with {tutorName}</p>
          <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{session?.date}</span>
            <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{session?.time}</span>
          </div>
        </div>
        <div className="text-right space-y-2">
          <PaymentStatusBadge status={booking.payment_status} />

          {/* WhatsApp group button - shown only when payment is confirmed */}
          {paymentConfirmed && whatsappUrl && (
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
              <Button size="sm" className="w-full gap-1 bg-[hsl(var(--success))] text-[hsl(var(--success-foreground,0_0%_100%))] hover:bg-[hsl(var(--success))]/90">
                <MessageCircle className="h-3 w-3" /> Open WhatsApp Group
              </Button>
            </a>
          )}

          {booking.payment_status === 'pending' && (
            <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="w-full gap-1">
                  <Upload className="h-3 w-3" /> Upload Proof
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Upload Payment Proof</DialogTitle></DialogHeader>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Upload a screenshot or photo of your bank deposit slip for <strong>N${session?.price}</strong>.
                  </p>
                  <div>
                    <Label htmlFor="proof">Payment Proof Image</Label>
                    <Input id="proof" type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                  </div>
                  <Button className="w-full" disabled={!file || uploadMutation.isPending} onClick={() => uploadMutation.mutate()}>
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
