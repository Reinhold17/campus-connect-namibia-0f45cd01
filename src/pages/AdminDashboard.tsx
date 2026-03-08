import { useState, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { DashboardLayout } from '@/components/DashboardLayout';
import { StatusBadge } from '@/components/StatusBadge';
import { supabase } from '@/integrations/supabase/client';
import { sendNotification } from '@/lib/notifications';
import {
  ShieldCheck, CreditCard, Calendar, Users, BarChart3, UserCheck,
  BookOpen, GraduationCap, Eye, MapPin, Phone, Mail, FileText,
  ChevronDown, ChevronUp, ExternalLink, User, AlertTriangle,
  Ban, CheckCircle, TrendingUp, DollarSign, Plus, Trash2, Edit, Flag
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { isTutorVerified, VerifiedBadge } from '@/components/VerifiedBadge';

const sidebarItems = [
  { label: 'Overview', icon: BarChart3, to: '/admin' },
  { label: 'Tutor Approvals', icon: UserCheck, to: '/admin/approvals' },
  { label: 'Manage Tutors', icon: GraduationCap, to: '/admin/tutors' },
  { label: 'Payments', icon: CreditCard, to: '/admin/payments' },
  { label: 'Modules', icon: BookOpen, to: '/admin/modules' },
  { label: 'Users', icon: Users, to: '/admin/users' },
  { label: 'Reports', icon: Flag, to: '/admin/reports' },
];

export default function AdminDashboard() {
  const location = useLocation();
  const path = location.pathname;

  let activeTab = 'overview';
  if (path.includes('/approvals')) activeTab = 'approvals';
  else if (path.includes('/tutors')) activeTab = 'tutors';
  else if (path.includes('/payments')) activeTab = 'payments';
  else if (path.includes('/modules')) activeTab = 'modules';
  else if (path.includes('/users')) activeTab = 'users';
  else if (path.includes('/reports')) activeTab = 'reports';

  return (
    <DashboardLayout title="Admin Dashboard" items={sidebarItems}>
      {activeTab === 'overview' && <OverviewTab />}
      {activeTab === 'approvals' && <ApprovalsTab />}
      {activeTab === 'tutors' && <ManageTutorsTab />}
      {activeTab === 'payments' && <PaymentsTab />}
      {activeTab === 'modules' && <ModulesTab />}
      {activeTab === 'users' && <UsersTab />}
      {activeTab === 'reports' && <ReportsTab />}
    </DashboardLayout>
  );
}

/* ==================== OVERVIEW TAB ==================== */
function OverviewTab() {
  const { data: stats } = useQuery({
    queryKey: ['admin-overview-stats'],
    queryFn: async () => {
      const [studentsRes, tutorsRes, sessionsRes, revenueRes, pendingRes] = await Promise.all([
        supabase.from('user_roles').select('id', { count: 'exact', head: true }).eq('role', 'student'),
        supabase.from('user_roles').select('id', { count: 'exact', head: true }).eq('role', 'tutor'),
        supabase.from('bookings').select('id', { count: 'exact', head: true }),
        supabase.from('bookings').select('sessions(price)').eq('payment_status', 'confirmed'),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      ]);
      const revenue = (revenueRes.data || []).reduce((sum: number, b: any) => sum + (b.sessions?.price || 0), 0);
      return {
        students: studentsRes.count || 0,
        tutors: tutorsRes.count || 0,
        sessions: sessionsRes.count || 0,
        revenue,
        pending: pendingRes.count || 0,
      };
    },
  });

  const statCards = [
    { label: 'Total Students', value: stats?.students || 0, icon: Users, color: 'text-primary' },
    { label: 'Total Tutors', value: stats?.tutors || 0, icon: GraduationCap, color: 'text-success' },
    { label: 'Sessions Booked', value: stats?.sessions || 0, icon: Calendar, color: 'text-accent' },
    { label: 'Revenue Generated', value: `N$${(stats?.revenue || 0).toLocaleString()}`, icon: DollarSign, color: 'text-secondary' },
    { label: 'Pending Approvals', value: stats?.pending || 0, icon: AlertTriangle, color: 'text-warning' },
  ];

  return (
    <div className="space-y-6">
      <h2 className="font-display text-xl font-bold">Platform Analytics</h2>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-5">
        {statCards.map(card => (
          <div key={card.label} className="rounded-xl border bg-card p-5 shadow-card">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <card.icon className={`h-4 w-4 ${card.color}`} />
              {card.label}
            </div>
            <p className="mt-2 font-display text-2xl font-bold">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Recent activity summary */}
      <RecentActivity />
    </div>
  );
}

function RecentActivity() {
  const { data: recentBookings = [] } = useQuery({
    queryKey: ['admin-recent-bookings'],
    queryFn: async () => {
      const { data } = await supabase
        .from('bookings')
        .select('*, sessions(subject, price), student:profiles!bookings_student_id_fkey1(name)')
        .order('created_at', { ascending: false })
        .limit(5);
      return data || [];
    },
  });

  return (
    <div className="rounded-xl border bg-card p-5 shadow-card">
      <h3 className="mb-4 font-display text-lg font-bold">Recent Bookings</h3>
      {recentBookings.length === 0 ? (
        <p className="text-sm text-muted-foreground">No recent bookings.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentBookings.map((b: any) => (
              <TableRow key={b.id}>
                <TableCell className="font-medium">{b.student?.name || 'Unknown'}</TableCell>
                <TableCell>{b.sessions?.subject || '—'}</TableCell>
                <TableCell><StatusBadge status={b.payment_status === 'confirmed' ? 'confirmed' : 'pending'} /></TableCell>
                <TableCell><StatusBadge status={b.status === 'confirmed' ? 'confirmed' : b.status === 'completed' ? 'completed' : 'pending'} /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}

/* ==================== APPROVALS TAB ==================== */
function ApprovalsTab() {
  const queryClient = useQueryClient();

  const { data: pendingTutors = [] } = useQuery({
    queryKey: ['admin-pending-tutors'],
    queryFn: async () => {
      const { data, error } = await supabase.from('profiles').select('*').eq('status', 'pending');
      if (error) throw error;
      return data;
    },
  });

  const pendingUserIds = pendingTutors.map(t => t.user_id);
  const { data: allModuleGrades = [] } = useQuery({
    queryKey: ['admin-tutor-module-grades', pendingUserIds],
    queryFn: async () => {
      if (pendingUserIds.length === 0) return [];
      const { data, error } = await supabase
        .from('tutor_module_grades')
        .select('*, modules(name)')
        .in('user_id', pendingUserIds);
      if (error) throw error;
      return data || [];
    },
    enabled: pendingUserIds.length > 0,
  });

  const approveTutor = useMutation({
    mutationFn: async ({ userId, approve }: { userId: string; approve: boolean }) => {
      const { error } = await supabase
        .from('profiles')
        .update({ status: approve ? 'approved' : 'rejected' })
        .eq('user_id', userId);
      if (error) throw error;

      if (approve) {
        // Update role to tutor
        const { error: roleError } = await supabase
          .from('user_roles')
          .update({ role: 'tutor' } as any)
          .eq('user_id', userId);
        if (roleError) console.error('Role update error:', roleError);
      }

      await sendNotification({
        type: approve ? 'tutor_approved' : 'tutor_rejected',
        recipientUserId: userId,
        data: { reason: approve ? undefined : 'Application did not meet requirements' },
      });
    },
    onSuccess: (_, { approve }) => {
      toast.success(approve ? 'Tutor approved & notified!' : 'Tutor rejected & notified.');
      queryClient.invalidateQueries({ queryKey: ['admin-pending-tutors'] });
      queryClient.invalidateQueries({ queryKey: ['admin-overview-stats'] });
    },
    onError: (err: any) => toast.error(err.message),
  });

  return (
    <div className="space-y-4">
      <h2 className="font-display text-xl font-bold">Pending Tutor Approvals ({pendingTutors.length})</h2>
      {pendingTutors.length === 0 ? (
        <p className="text-sm text-muted-foreground">No pending approvals.</p>
      ) : (
        <div className="space-y-4">
          {pendingTutors.map(tutor => (
            <TutorApplicationCard
              key={tutor.id}
              tutor={tutor}
              moduleGrades={allModuleGrades.filter((mg: any) => mg.user_id === tutor.user_id)}
              onApprove={() => approveTutor.mutate({ userId: tutor.user_id, approve: true })}
              onReject={() => approveTutor.mutate({ userId: tutor.user_id, approve: false })}
              isLoading={approveTutor.isPending}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ==================== MANAGE TUTORS TAB ==================== */
function ManageTutorsTab() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');

  const { data: tutors = [] } = useQuery({
    queryKey: ['admin-all-tutors'],
    queryFn: async () => {
      const { data: tutorRoles } = await supabase.from('user_roles').select('user_id').eq('role', 'tutor');
      const ids = (tutorRoles || []).map((r: any) => r.user_id);
      if (ids.length === 0) return [];
      const { data } = await supabase.from('profiles').select('*').in('user_id', ids).order('name');
      return data || [];
    },
  });

  const suspendMutation = useMutation({
    mutationFn: async ({ userId, suspend }: { userId: string; suspend: boolean }) => {
      const { error } = await supabase
        .from('profiles')
        .update({ status: suspend ? 'suspended' : 'approved' })
        .eq('user_id', userId);
      if (error) throw error;

      await sendNotification({
        type: suspend ? 'tutor_rejected' : 'tutor_approved',
        recipientUserId: userId,
        data: { reason: suspend ? 'Your account has been suspended by an administrator.' : 'Your account has been reactivated.' },
      });
    },
    onSuccess: (_, { suspend }) => {
      toast.success(suspend ? 'Tutor suspended.' : 'Tutor reactivated.');
      queryClient.invalidateQueries({ queryKey: ['admin-all-tutors'] });
    },
    onError: (err: any) => toast.error(err.message),
  });

  const filtered = useMemo(() => {
    if (!search) return tutors;
    const q = search.toLowerCase();
    return tutors.filter((t: any) => t.name.toLowerCase().includes(q) || t.email.toLowerCase().includes(q));
  }, [tutors, search]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold">Manage Tutors ({tutors.length})</h2>
        <Input placeholder="Search tutors..." value={search} onChange={e => setSearch(e.target.value)} className="max-w-xs" />
      </div>
      <div className="rounded-xl border bg-card shadow-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>University</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Verified</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((tutor: any) => (
              <TableRow key={tutor.id}>
                <TableCell>
                  <div>
                    <p className="font-medium">{tutor.name}</p>
                    <p className="text-xs text-muted-foreground">{tutor.email}</p>
                  </div>
                </TableCell>
                <TableCell>{tutor.university || '—'}</TableCell>
                <TableCell><StatusBadge status={tutor.status as any} /></TableCell>
                <TableCell>
                  {isTutorVerified(tutor) ? (
                    <VerifiedBadge showLabel />
                  ) : (
                    <span className="text-xs text-muted-foreground">Not verified</span>
                  )}
                </TableCell>
                <TableCell>{tutor.rating || 0}</TableCell>
                <TableCell className="text-right">
                  {tutor.status === 'approved' ? (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-destructive"
                      onClick={() => suspendMutation.mutate({ userId: tutor.user_id, suspend: true })}
                      disabled={suspendMutation.isPending}
                    >
                      <Ban className="mr-1 h-3 w-3" /> Suspend
                    </Button>
                  ) : tutor.status === 'suspended' ? (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-success"
                      onClick={() => suspendMutation.mutate({ userId: tutor.user_id, suspend: false })}
                      disabled={suspendMutation.isPending}
                    >
                      <CheckCircle className="mr-1 h-3 w-3" /> Reactivate
                    </Button>
                  ) : null}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

/* ==================== PAYMENTS TAB ==================== */
function PaymentsTab() {
  const queryClient = useQueryClient();

  const { data: pendingPayments = [] } = useQuery({
    queryKey: ['admin-pending-payments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select('*, sessions(subject, price, tutor_id), student:profiles!bookings_student_id_fkey1(name, email)')
        .in('payment_status', ['uploaded', 'pending_verification'])
        .order('updated_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const confirmPayment = useMutation({
    mutationFn: async ({ bookingId, confirm, studentId, subject }: { bookingId: string; confirm: boolean; studentId: string; subject: string }) => {
      const { error } = await supabase
        .from('bookings')
        .update({ payment_status: confirm ? 'confirmed' : 'rejected', status: confirm ? 'confirmed' : 'cancelled' })
        .eq('id', bookingId);
      if (error) throw error;
      await sendNotification({
        type: 'payment_update',
        recipientUserId: studentId,
        data: { paymentStatus: confirm ? 'confirmed' : 'rejected', subject },
      });
    },
    onSuccess: (_, { confirm }) => {
      toast.success(confirm ? 'Payment confirmed!' : 'Payment rejected.');
      queryClient.invalidateQueries({ queryKey: ['admin-pending-payments'] });
    },
    onError: (err: any) => toast.error(err.message),
  });

  return (
    <div className="space-y-4">
      <h2 className="font-display text-xl font-bold">Pending Payments ({pendingPayments.length})</h2>
      {pendingPayments.length === 0 ? (
        <p className="text-sm text-muted-foreground">No pending payments.</p>
      ) : (
        <div className="space-y-3">
          {pendingPayments.map((payment: any) => (
            <PaymentCard key={payment.id} payment={payment} onConfirm={confirmPayment} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ==================== MODULES TAB ==================== */
function ModulesTab() {
  const queryClient = useQueryClient();
  const [selectedUni, setSelectedUni] = useState<string>('all');
  const [selectedFac, setSelectedFac] = useState<string>('all');
  const [newModuleName, setNewModuleName] = useState('');
  const [newModuleFaculty, setNewModuleFaculty] = useState('');
  const [newWhatsapp, setNewWhatsapp] = useState('');
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  const { data: universities = [] } = useQuery({
    queryKey: ['admin-universities'],
    queryFn: async () => {
      const { data } = await supabase.from('universities').select('*').order('name');
      return data || [];
    },
  });

  const { data: faculties = [] } = useQuery({
    queryKey: ['admin-faculties'],
    queryFn: async () => {
      const { data } = await supabase.from('faculties').select('*').order('name');
      return data || [];
    },
  });

  const { data: modules = [] } = useQuery({
    queryKey: ['admin-modules'],
    queryFn: async () => {
      const { data } = await supabase.from('modules').select('*, faculties(name, university_id)').order('name');
      return data || [];
    },
  });

  const filteredFaculties = useMemo(() =>
    selectedUni === 'all' ? faculties : faculties.filter((f: any) => f.university_id === selectedUni),
    [selectedUni, faculties]
  );

  const filteredModules = useMemo(() => {
    let list = modules;
    if (selectedFac !== 'all') list = list.filter((m: any) => m.faculty_id === selectedFac);
    else if (selectedUni !== 'all') {
      const facIds = faculties.filter((f: any) => f.university_id === selectedUni).map((f: any) => f.id);
      list = list.filter((m: any) => facIds.includes(m.faculty_id));
    }
    return list;
  }, [modules, selectedUni, selectedFac, faculties]);

  const addModule = useMutation({
    mutationFn: async () => {
      if (!newModuleName.trim() || !newModuleFaculty) throw new Error('Name and faculty required');
      const { error } = await supabase.from('modules').insert({
        name: newModuleName.trim(),
        faculty_id: newModuleFaculty,
        whatsapp_group_url: newWhatsapp.trim() || null,
      } as any);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Module added!');
      setNewModuleName('');
      setNewWhatsapp('');
      setAddDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['admin-modules'] });
    },
    onError: (err: any) => toast.error(err.message),
  });

  const deleteModule = useMutation({
    mutationFn: async (moduleId: string) => {
      const { error } = await supabase.from('modules').delete().eq('id', moduleId) as any;
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Module deleted.');
      queryClient.invalidateQueries({ queryKey: ['admin-modules'] });
    },
    onError: (err: any) => toast.error(err.message),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold">Module Management ({modules.length})</h2>
        <Button size="sm" onClick={() => setAddDialogOpen(true)}>
          <Plus className="mr-1 h-3 w-3" /> Add Module
        </Button>
      </div>

      <div className="flex flex-wrap gap-3">
        <Select value={selectedUni} onValueChange={(v) => { setSelectedUni(v); setSelectedFac('all'); }}>
          <SelectTrigger className="w-48"><SelectValue placeholder="University" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Universities</SelectItem>
            {universities.map((u: any) => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={selectedFac} onValueChange={setSelectedFac}>
          <SelectTrigger className="w-48"><SelectValue placeholder="Faculty" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Faculties</SelectItem>
            {filteredFaculties.map((f: any) => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-xl border bg-card shadow-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Module</TableHead>
              <TableHead>Faculty</TableHead>
              <TableHead>WhatsApp</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredModules.map((mod: any) => (
              <TableRow key={mod.id}>
                <TableCell className="font-medium">{mod.name}</TableCell>
                <TableCell>{mod.faculties?.name || '—'}</TableCell>
                <TableCell>
                  {mod.whatsapp_group_url ? (
                    <a href={mod.whatsapp_group_url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">
                      <ExternalLink className="inline h-3 w-3 mr-1" />Link
                    </a>
                  ) : <span className="text-xs text-muted-foreground">None</span>}
                </TableCell>
                <TableCell className="text-right">
                  <Button size="sm" variant="ghost" className="text-destructive" onClick={() => deleteModule.mutate(mod.id)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {filteredModules.length === 0 && (
              <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">No modules found.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add New Module</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Faculty</label>
              <Select value={newModuleFaculty} onValueChange={setNewModuleFaculty}>
                <SelectTrigger><SelectValue placeholder="Select faculty" /></SelectTrigger>
                <SelectContent>
                  {faculties.map((f: any) => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Module Name</label>
              <Input value={newModuleName} onChange={e => setNewModuleName(e.target.value)} placeholder="e.g. Introduction to Computing" />
            </div>
            <div>
              <label className="text-sm font-medium">WhatsApp Group URL (optional)</label>
              <Input value={newWhatsapp} onChange={e => setNewWhatsapp(e.target.value)} placeholder="https://chat.whatsapp.com/..." />
            </div>
            <Button onClick={() => addModule.mutate()} disabled={addModule.isPending} className="w-full">
              Add Module
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ==================== USERS TAB ==================== */
function UsersTab() {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const { data: allUsers = [] } = useQuery({
    queryKey: ['admin-all-users'],
    queryFn: async () => {
      const { data: profiles } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
      const { data: roles } = await supabase.from('user_roles').select('*');
      return (profiles || []).map((p: any) => ({
        ...p,
        role: (roles || []).find((r: any) => r.user_id === p.user_id)?.role || 'student',
      }));
    },
  });

  const filtered = useMemo(() => {
    let list = allUsers;
    if (roleFilter !== 'all') list = list.filter((u: any) => u.role === roleFilter);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((u: any) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
    }
    return list;
  }, [allUsers, roleFilter, search]);

  return (
    <div className="space-y-4">
      <h2 className="font-display text-xl font-bold">All Users ({allUsers.length})</h2>
      <div className="flex flex-wrap gap-3">
        <Input placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} className="max-w-xs" />
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Role" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="student">Students</SelectItem>
            <SelectItem value="tutor">Tutors</SelectItem>
            <SelectItem value="admin">Admins</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="rounded-xl border bg-card shadow-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Joined</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((user: any) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell className="text-muted-foreground">{user.email}</TableCell>
                <TableCell>
                  <Badge variant={user.role === 'admin' ? 'default' : user.role === 'tutor' ? 'secondary' : 'outline'} className="capitalize text-xs">
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell><StatusBadge status={user.status as any} /></TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {new Date(user.created_at).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

/* ==================== REPORTS TAB ==================== */
function ReportsTab() {
  const { data: sessionStats } = useQuery({
    queryKey: ['admin-session-stats'],
    queryFn: async () => {
      const { data: sessions } = await supabase.from('sessions').select('subject, type, date, price');
      const { data: bookings } = await supabase.from('bookings').select('status, payment_status, created_at');

      const totalSessions = sessions?.length || 0;
      const groupSessions = sessions?.filter((s: any) => s.type === 'group').length || 0;
      const oneOnOneSessions = totalSessions - groupSessions;
      const confirmedBookings = bookings?.filter((b: any) => b.payment_status === 'confirmed').length || 0;
      const pendingBookings = bookings?.filter((b: any) => b.payment_status === 'pending').length || 0;
      const cancelledBookings = bookings?.filter((b: any) => b.status === 'cancelled').length || 0;

      // Popular subjects
      const subjectCounts: Record<string, number> = {};
      sessions?.forEach((s: any) => { subjectCounts[s.subject] = (subjectCounts[s.subject] || 0) + 1; });
      const popularSubjects = Object.entries(subjectCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5);

      return {
        totalSessions, groupSessions, oneOnOneSessions,
        confirmedBookings, pendingBookings, cancelledBookings,
        popularSubjects,
      };
    },
  });

  return (
    <div className="space-y-6">
      <h2 className="font-display text-xl font-bold">Platform Reports</h2>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border bg-card p-5 shadow-card">
          <h3 className="text-sm font-semibold text-muted-foreground">Sessions Created</h3>
          <p className="mt-1 font-display text-2xl font-bold">{sessionStats?.totalSessions || 0}</p>
          <div className="mt-2 flex gap-3 text-xs text-muted-foreground">
            <span>Group: {sessionStats?.groupSessions || 0}</span>
            <span>1-on-1: {sessionStats?.oneOnOneSessions || 0}</span>
          </div>
        </div>
        <div className="rounded-xl border bg-card p-5 shadow-card">
          <h3 className="text-sm font-semibold text-muted-foreground">Confirmed Bookings</h3>
          <p className="mt-1 font-display text-2xl font-bold text-success">{sessionStats?.confirmedBookings || 0}</p>
        </div>
        <div className="rounded-xl border bg-card p-5 shadow-card">
          <h3 className="text-sm font-semibold text-muted-foreground">Cancelled Bookings</h3>
          <p className="mt-1 font-display text-2xl font-bold text-destructive">{sessionStats?.cancelledBookings || 0}</p>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-5 shadow-card">
        <h3 className="mb-3 font-display text-lg font-bold">Popular Subjects</h3>
        {sessionStats?.popularSubjects && sessionStats.popularSubjects.length > 0 ? (
          <div className="space-y-2">
            {sessionStats.popularSubjects.map(([subject, count]) => (
              <div key={subject} className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2">
                <span className="text-sm font-medium">{subject}</span>
                <Badge variant="secondary">{count} sessions</Badge>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No session data yet.</p>
        )}
      </div>
    </div>
  );
}

/* ==================== SHARED COMPONENTS ==================== */

function TutorApplicationCard({
  tutor, moduleGrades, onApprove, onReject, isLoading,
}: {
  tutor: any; moduleGrades: any[]; onApprove: () => void; onReject: () => void; isLoading: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const [docDialogOpen, setDocDialogOpen] = useState(false);
  const [docUrl, setDocUrl] = useState<string | null>(null);
  const [docTitle, setDocTitle] = useState('');

  const viewDocument = async (path: string | null, title: string) => {
    if (!path) { toast.error(`No ${title.toLowerCase()} uploaded`); return; }
    const { data } = await supabase.storage.from('identity-documents').createSignedUrl(path, 300);
    if (data?.signedUrl) { setDocUrl(data.signedUrl); setDocTitle(title); setDocDialogOpen(true); }
    else toast.error('Could not load document');
  };

  const availability = tutor.availability as Record<string, string[]> | null;
  const hasAvailability = availability && Object.keys(availability).some(day => (availability[day] || []).length > 0);

  return (
    <>
      <div className="rounded-xl border bg-card shadow-card overflow-hidden">
        <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
              <User className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">{tutor.name}</h3>
              <p className="text-xs text-muted-foreground">{tutor.university || 'No university'} · {tutor.year_of_study || '—'}</p>
            </div>
            <StatusBadge status="pending" />
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

        {expanded && (
          <div className="border-t bg-muted/20 p-4 space-y-4 animate-fade-in">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <InfoItem icon={Mail} label="Email" value={tutor.email} />
              <InfoItem icon={Phone} label="Phone" value={tutor.phone_number || 'Not provided'} />
              <InfoItem icon={GraduationCap} label="Year" value={tutor.year_of_study || '—'} />
            </div>
            <Separator />
            <div>
              <h4 className="mb-2 flex items-center gap-1.5 text-sm font-semibold"><MapPin className="h-4 w-4 text-primary" /> Location</h4>
              <div className="grid gap-3 sm:grid-cols-3">
                <InfoItem label="City" value={tutor.city || 'Not provided'} />
                <InfoItem label="Campus" value={tutor.campus || 'Not provided'} />
                <InfoItem label="Neighbourhood" value={tutor.neighbourhood || 'Not provided'} />
              </div>
            </div>
            <Separator />
            <div>
              <h4 className="mb-2 flex items-center gap-1.5 text-sm font-semibold"><BookOpen className="h-4 w-4 text-primary" /> Modules & Grades</h4>
              {moduleGrades.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {moduleGrades.map((mg: any) => (
                    <Badge key={mg.id} variant="secondary" className="gap-1 py-1.5">
                      {mg.modules?.name || 'Module'} — <span className="font-bold">{mg.grade}</span>
                    </Badge>
                  ))}
                </div>
              ) : <p className="text-sm text-muted-foreground">No modules listed</p>}
            </div>
            <Separator />
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
            <div>
              <h4 className="mb-2 flex items-center gap-1.5 text-sm font-semibold"><FileText className="h-4 w-4 text-primary" /> Documents</h4>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => viewDocument(tutor.student_id_url, 'Student ID')} disabled={!tutor.student_id_url}>
                  <Eye className="mr-1 h-3 w-3" /> Student ID {!tutor.student_id_url && <span className="ml-1 text-muted-foreground">(missing)</span>}
                </Button>
                <Button size="sm" variant="outline" onClick={() => viewDocument(tutor.government_id_url, 'Government ID')} disabled={!tutor.government_id_url}>
                  <ShieldCheck className="mr-1 h-3 w-3" /> Government ID {!tutor.government_id_url && <span className="ml-1 text-muted-foreground">(missing)</span>}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      <Dialog open={docDialogOpen} onOpenChange={setDocDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{docTitle}</DialogTitle></DialogHeader>
          {docUrl && (
            docUrl.includes('.pdf') ? (
              <div className="flex flex-col items-center gap-3">
                <p className="text-sm text-muted-foreground">PDF document</p>
                <Button asChild variant="outline">
                  <a href={docUrl} target="_blank" rel="noopener noreferrer"><ExternalLink className="mr-1 h-4 w-4" /> Open PDF</a>
                </Button>
              </div>
            ) : <img src={docUrl} alt={docTitle} className="w-full rounded-lg" />
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
    if (!payment.payment_proof_url) {
      toast.error('No proof of payment uploaded');
      return;
    }
    const { data, error } = await supabase.storage.from('payment-proofs').createSignedUrl(payment.payment_proof_url, 600);
    if (error) {
      console.error('Signed URL error:', error);
      toast.error('Could not load proof: ' + error.message);
      return;
    }
    if (data?.signedUrl) {
      setProofUrl(data.signedUrl);
      setViewOpen(true);
    } else {
      toast.error('Could not load proof image');
    }
  };

  const isPdf = payment.payment_proof_url?.endsWith('.pdf');

  return (
    <>
      <div className="flex flex-col gap-3 rounded-xl border bg-card p-4 shadow-card sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="font-medium">{payment.student?.name || 'Student'}</h3>
          <p className="text-sm text-muted-foreground">{payment.sessions?.subject} · N${payment.sessions?.price}</p>
          <p className="text-xs text-muted-foreground">{payment.student?.email}</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" onClick={() => onConfirm.mutate({ bookingId: payment.id, confirm: true, studentId: payment.student_id, subject: payment.sessions?.subject })}>Confirm</Button>
          <Button size="sm" variant="outline" className="text-destructive" onClick={() => onConfirm.mutate({ bookingId: payment.id, confirm: false, studentId: payment.student_id, subject: payment.sessions?.subject })}>Reject</Button>
          <Button size="sm" variant="outline" onClick={handleViewProof}><Eye className="mr-1 h-3 w-3" /> Proof</Button>
        </div>
      </div>

      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Payment Proof</DialogTitle></DialogHeader>
          {proofUrl && (
            <>
              {isPdf 
                ? <iframe src={proofUrl} className="w-full h-[500px] rounded-lg" title="Payment proof PDF" />
                : <img src={proofUrl} alt="Payment proof" className="w-full rounded-lg" />
              }
              <a href={proofUrl} download target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="w-full mt-3 gap-2">
                  <ExternalLink className="h-4 w-4" /> Download Proof
                </Button>
              </a>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
