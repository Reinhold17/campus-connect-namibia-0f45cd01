import { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { StatusBadge } from '@/components/StatusBadge';
import { supabase } from '@/integrations/supabase/client';
import { sendNotification } from '@/lib/notifications';
import {
  ShieldCheck, CreditCard, Calendar, Users, BarChart3, UserCheck,
  BookOpen, GraduationCap, Eye, MapPin, Phone, Mail, FileText,
  ChevronDown, ChevronUp, ExternalLink, User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
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

  // Fetch module grades for all pending tutors
  const pendingUserIds = pendingTutors.map(t => t.user_id);
  const { data: allModuleGrades = [] } = useQuery({
    queryKey: ['admin-tutor-module-grades', pendingUserIds],
    queryFn: async () => {
      if (pendingUserIds.length === 0) return [];
      const { data, error } = await supabase
        .from('tutor_module_grades' as any)
        .select('*, modules(name)')
        .in('user_id', pendingUserIds);
      if (error) throw error;
      return data || [];
    },
    enabled: pendingUserIds.length > 0,
  });

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
    mutationFn: async ({ bookingId, confirm, studentId, subject }: { bookingId: string; confirm: boolean; studentId: string; subject: string }) => {
      const { error } = await supabase
        .from('bookings')
        .update({
          payment_status: confirm ? 'confirmed' : 'rejected',
          status: confirm ? 'confirmed' : 'cancelled',
        })
        .eq('id', bookingId);
      if (error) throw error;

      await sendNotification({
        type: 'payment_update',
        recipientUserId: studentId,
        data: { paymentStatus: confirm ? 'confirmed' : 'rejected', subject },
      });
    },
    onSuccess: (_, { confirm }) => {
      toast.success(confirm ? 'Payment confirmed & student notified!' : 'Payment rejected & student notified.');
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
          <h2 className="mb-4 font-display text-lg font-bold">Pending Tutor Approvals ({pendingTutors.length})</h2>
          {pendingTutors.length === 0 ? (
            <p className="text-sm text-muted-foreground">No pending approvals.</p>
          ) : (
            <div className="space-y-4">
              {pendingTutors.map(tutor => {
                const tutorGrades = allModuleGrades.filter((mg: any) => mg.user_id === tutor.user_id);
                return (
                  <TutorApplicationCard
                    key={tutor.id}
                    tutor={tutor}
                    moduleGrades={tutorGrades}
                    onApprove={() => approveTutor.mutate({ userId: tutor.user_id, approve: true })}
                    onReject={() => approveTutor.mutate({ userId: tutor.user_id, approve: false })}
                    isLoading={approveTutor.isPending}
                  />
                );
              })}
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

function TutorApplicationCard({
  tutor,
  moduleGrades,
  onApprove,
  onReject,
  isLoading,
}: {
  tutor: any;
  moduleGrades: any[];
  onApprove: () => void;
  onReject: () => void;
  isLoading: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const [docDialogOpen, setDocDialogOpen] = useState(false);
  const [docUrl, setDocUrl] = useState<string | null>(null);
  const [docTitle, setDocTitle] = useState('');

  const viewDocument = async (path: string | null, title: string) => {
    if (!path) {
      toast.error(`No ${title.toLowerCase()} uploaded`);
      return;
    }
    const { data } = await supabase.storage
      .from('identity-documents')
      .createSignedUrl(path, 300);
    if (data?.signedUrl) {
      setDocUrl(data.signedUrl);
      setDocTitle(title);
      setDocDialogOpen(true);
    } else {
      toast.error('Could not load document');
    }
  };

  const availability = tutor.availability as Record<string, string[]> | null;
  const hasAvailability = availability && Object.keys(availability).some(day => (availability[day] || []).length > 0);

  return (
    <>
      <div className="rounded-xl border bg-card shadow-card overflow-hidden">
        {/* Summary row */}
        <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                <User className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">{tutor.name}</h3>
                <p className="text-xs text-muted-foreground">
                  {tutor.university || 'No university'} · {tutor.year_of_study || '—'}
                </p>
              </div>
              <StatusBadge status="pending" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="ghost" onClick={() => setExpanded(!expanded)}>
              {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              {expanded ? 'Less' : 'Review'}
            </Button>
            <Button size="sm" onClick={onApprove} disabled={isLoading}>Approve</Button>
            <Button size="sm" variant="outline" className="text-destructive" onClick={onReject} disabled={isLoading}>Reject</Button>
          </div>
        </div>

        {/* Expanded details */}
        {expanded && (
          <div className="border-t bg-muted/20 p-4 space-y-4 animate-fade-in">
            {/* Contact & Basic */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <InfoItem icon={Mail} label="Email" value={tutor.email} />
              <InfoItem icon={Phone} label="Phone" value={tutor.phone_number || 'Not provided'} />
              <InfoItem icon={GraduationCap} label="Year" value={tutor.year_of_study || '—'} />
            </div>

            <Separator />

            {/* Location */}
            <div>
              <h4 className="mb-2 flex items-center gap-1.5 text-sm font-semibold">
                <MapPin className="h-4 w-4 text-primary" /> Location
              </h4>
              <div className="grid gap-3 sm:grid-cols-3">
                <InfoItem label="City" value={tutor.city || 'Not provided'} />
                <InfoItem label="Campus" value={tutor.campus || 'Not provided'} />
                <InfoItem label="Neighbourhood" value={tutor.neighbourhood || 'Not provided'} />
              </div>
            </div>

            <Separator />

            {/* Modules & Grades */}
            <div>
              <h4 className="mb-2 flex items-center gap-1.5 text-sm font-semibold">
                <BookOpen className="h-4 w-4 text-primary" /> Modules & Grades
              </h4>
              {moduleGrades.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {moduleGrades.map((mg: any) => (
                    <Badge key={mg.id} variant="secondary" className="gap-1 py-1.5">
                      {mg.modules?.name || 'Module'} — <span className="font-bold">{mg.grade}</span>
                    </Badge>
                  ))}
                </div>
              ) : tutor.subjects?.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {tutor.subjects.map((s: string) => (
                    <Badge key={s} variant="secondary">{s}</Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No modules listed</p>
              )}
            </div>

            <Separator />

            {/* Bio & Teaching Style */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <h4 className="mb-1 text-sm font-semibold">Bio</h4>
                <p className="text-sm text-muted-foreground">{tutor.bio || 'No bio provided'}</p>
              </div>
              <div>
                <h4 className="mb-1 text-sm font-semibold">Teaching Style</h4>
                <p className="text-sm text-muted-foreground">{tutor.teaching_style || 'Not specified'}</p>
              </div>
            </div>

            {/* Availability */}
            {hasAvailability && (
              <>
                <Separator />
                <div>
                  <h4 className="mb-2 text-sm font-semibold">Availability</h4>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(availability!).map(([day, slots]) =>
                      (slots as string[]).length > 0 ? (
                        <div key={day} className="rounded-lg border bg-background p-2 text-xs">
                          <span className="font-medium">{day.slice(0, 3)}: </span>
                          <span className="text-muted-foreground">{(slots as string[]).join(', ')}</span>
                        </div>
                      ) : null
                    )}
                  </div>
                </div>
              </>
            )}

            <Separator />

            {/* Documents */}
            <div>
              <h4 className="mb-2 flex items-center gap-1.5 text-sm font-semibold">
                <FileText className="h-4 w-4 text-primary" /> Uploaded Documents
              </h4>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => viewDocument(tutor.student_id_url, 'Student ID')}
                  disabled={!tutor.student_id_url}
                >
                  <Eye className="mr-1 h-3 w-3" /> Student ID
                  {!tutor.student_id_url && <span className="ml-1 text-muted-foreground">(missing)</span>}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => viewDocument(tutor.government_id_url, 'Government ID')}
                  disabled={!tutor.government_id_url}
                >
                  <ShieldCheck className="mr-1 h-3 w-3" /> Government ID
                  {!tutor.government_id_url && <span className="ml-1 text-muted-foreground">(missing)</span>}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Document viewer dialog */}
      <Dialog open={docDialogOpen} onOpenChange={setDocDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{docTitle}</DialogTitle>
          </DialogHeader>
          {docUrl && (
            docUrl.includes('.pdf') ? (
              <div className="flex flex-col items-center gap-3">
                <p className="text-sm text-muted-foreground">PDF document uploaded</p>
                <Button asChild variant="outline">
                  <a href={docUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-1 h-4 w-4" /> Open PDF
                  </a>
                </Button>
              </div>
            ) : (
              <img src={docUrl} alt={docTitle} className="w-full rounded-lg" />
            )
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

function InfoItem({ icon: Icon, label, value }: { icon?: any; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      {Icon && <Icon className="mt-0.5 h-3.5 w-3.5 text-muted-foreground" />}
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
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
          <Button size="sm" onClick={() => onConfirm.mutate({ bookingId: payment.id, confirm: true, studentId: payment.student_id, subject: payment.sessions?.subject })}>
            Confirm
          </Button>
          <Button size="sm" variant="outline" className="text-destructive" onClick={() => onConfirm.mutate({ bookingId: payment.id, confirm: false, studentId: payment.student_id, subject: payment.sessions?.subject })}>
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
