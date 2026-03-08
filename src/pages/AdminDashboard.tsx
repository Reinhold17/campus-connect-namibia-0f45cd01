import { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { StatusBadge } from '@/components/StatusBadge';
import { supabase } from '@/integrations/supabase/client';
import { sendNotification } from '@/lib/notifications';
import { ShieldCheck, CreditCard, Calendar, Users, BarChart3, UserCheck, DollarSign, BookOpen, GraduationCap, Eye, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const sidebarItems = [
  { label: 'Approve Tutors', icon: UserCheck, to: '/admin' },
  { label: 'Confirm Payments', icon: CreditCard, to: '/admin/payments' },
  { label: 'Manage Sessions', icon: Calendar, to: '/admin/sessions' },
  { label: 'View Users', icon: Users, to: '/admin/users' },
  { label: 'Analytics', icon: BarChart3, to: '/admin/analytics' },
];

export default function AdminDashboard() {
  const queryClient = useQueryClient();

  // Pending tutors
  const { data: pendingTutors = [] } = useQuery({
    queryKey: ['admin-pending-tutors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('status', 'pending');
      if (error) throw error;
      return data;
    },
  });

  // Pending payment bookings
  const { data: pendingPayments = [] } = useQuery({
    queryKey: ['admin-pending-payments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          sessions ( subject, price, tutor_id ),
          student:profiles!bookings_student_id_fkey1 ( name, email )
        `)
        .eq('payment_status', 'uploaded')
        .order('updated_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Stats
  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const [students, tutors, bookings] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('user_roles').select('id', { count: 'exact', head: true }).eq('role', 'tutor'),
        supabase.from('bookings').select('id', { count: 'exact', head: true }),
      ]);
      return {
        students: students.count || 0,
        tutors: tutors.count || 0,
        bookings: bookings.count || 0,
      };
    },
  });

  const approveTutor = useMutation({
    mutationFn: async ({ userId, approve }: { userId: string; approve: boolean }) => {
      const { error } = await supabase
        .from('profiles')
        .update({ status: approve ? 'approved' : 'rejected' })
        .eq('user_id', userId);
      if (error) throw error;

      // Send notification to tutor
      await sendNotification({
        type: approve ? 'tutor_approved' : 'tutor_rejected',
        recipientUserId: userId,
        data: { reason: approve ? undefined : 'Application did not meet requirements' },
      });
    },
    onSuccess: (_, { approve }) => {
      toast.success(approve ? 'Tutor approved & notified!' : 'Tutor rejected & notified.');
      queryClient.invalidateQueries({ queryKey: ['admin-pending-tutors'] });
    },
    onError: (err: any) => toast.error(err.message),
  });

  const confirmPayment = useMutation({
    mutationFn: async ({ bookingId, confirm }: { bookingId: string; confirm: boolean }) => {
      const { error } = await supabase
        .from('bookings')
        .update({
          payment_status: confirm ? 'confirmed' : 'rejected',
          status: confirm ? 'confirmed' : 'cancelled',
        })
        .eq('id', bookingId);
      if (error) throw error;
    },
    onSuccess: (_, { confirm }) => {
      toast.success(confirm ? 'Payment confirmed!' : 'Payment rejected.');
      queryClient.invalidateQueries({ queryKey: ['admin-pending-payments'] });
    },
    onError: (err: any) => toast.error(err.message),
  });

  return (
    <DashboardLayout title="Admin Dashboard" items={sidebarItems}>
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
          <div className="rounded-xl border bg-card p-5 shadow-card">
            <div className="flex items-center gap-2 text-sm text-muted-foreground"><Users className="h-4 w-4" />Total Users</div>
            <p className="mt-1 font-display text-2xl font-bold">{stats?.students || 0}</p>
          </div>
          <div className="rounded-xl border bg-card p-5 shadow-card">
            <div className="flex items-center gap-2 text-sm text-muted-foreground"><GraduationCap className="h-4 w-4" />Total Tutors</div>
            <p className="mt-1 font-display text-2xl font-bold">{stats?.tutors || 0}</p>
          </div>
          <div className="rounded-xl border bg-card p-5 shadow-card">
            <div className="flex items-center gap-2 text-sm text-muted-foreground"><BookOpen className="h-4 w-4" />Total Bookings</div>
            <p className="mt-1 font-display text-2xl font-bold">{stats?.bookings || 0}</p>
          </div>
        </div>

        {/* Pending Tutor Approvals */}
        <div>
          <h2 className="mb-4 font-display text-lg font-bold">Pending Tutor Approvals</h2>
          {pendingTutors.length === 0 ? (
            <p className="text-sm text-muted-foreground">No pending approvals.</p>
          ) : (
            <div className="space-y-3">
              {pendingTutors.map(tutor => (
                <div key={tutor.id} className="flex flex-col gap-3 rounded-xl border bg-card p-4 shadow-card sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{tutor.name}</h3>
                      <StatusBadge status="pending" />
                    </div>
                    <p className="text-sm text-muted-foreground">{tutor.university || 'No university'} · {tutor.email}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => approveTutor.mutate({ userId: tutor.user_id, approve: true })}>Approve</Button>
                    <Button size="sm" variant="outline" className="text-destructive" onClick={() => approveTutor.mutate({ userId: tutor.user_id, approve: false })}>Reject</Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pending Payments */}
        <div>
          <h2 className="mb-4 font-display text-lg font-bold">Pending Payment Confirmations</h2>
          {pendingPayments.length === 0 ? (
            <p className="text-sm text-muted-foreground">No pending payments.</p>
          ) : (
            <div className="space-y-3">
              {pendingPayments.map(payment => (
                <PaymentCard key={payment.id} payment={payment} onConfirm={confirmPayment} />
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

function PaymentCard({ payment, onConfirm }: { payment: any; onConfirm: any }) {
  const [viewOpen, setViewOpen] = useState(false);
  const [proofUrl, setProofUrl] = useState<string | null>(null);

  const handleViewProof = async () => {
    if (!payment.payment_proof_url) return;
    const { data } = await supabase.storage
      .from('payment-proofs')
      .createSignedUrl(payment.payment_proof_url, 300);
    if (data?.signedUrl) {
      setProofUrl(data.signedUrl);
      setViewOpen(true);
    } else {
      toast.error('Could not load proof image');
    }
  };

  return (
    <>
      <div className="flex flex-col gap-3 rounded-xl border bg-card p-4 shadow-card sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="font-medium">{payment.student?.name || 'Student'}</h3>
          <p className="text-sm text-muted-foreground">{payment.sessions?.subject} · N${payment.sessions?.price}</p>
          <p className="text-xs text-muted-foreground">{payment.student?.email}</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" onClick={() => onConfirm.mutate({ bookingId: payment.id, confirm: true })}>
            Confirm
          </Button>
          <Button size="sm" variant="outline" className="text-destructive" onClick={() => onConfirm.mutate({ bookingId: payment.id, confirm: false })}>
            Reject
          </Button>
          <Button size="sm" variant="outline" onClick={handleViewProof}>
            <Eye className="mr-1 h-3 w-3" /> Proof
          </Button>
        </div>
      </div>

      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Payment Proof</DialogTitle>
          </DialogHeader>
          {proofUrl && <img src={proofUrl} alt="Payment proof" className="w-full rounded-lg" />}
        </DialogContent>
      </Dialog>
    </>
  );
}
