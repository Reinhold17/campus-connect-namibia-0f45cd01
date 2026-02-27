import { DashboardLayout } from '@/components/DashboardLayout';
import { StatusBadge } from '@/components/StatusBadge';
import { mockTutors, mockSessions } from '@/lib/mock-data';
import { ShieldCheck, CreditCard, Calendar, Users, BarChart3, UserCheck, DollarSign, BookOpen, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const sidebarItems = [
  { label: 'Approve Tutors', icon: UserCheck, to: '/admin' },
  { label: 'Confirm Payments', icon: CreditCard, to: '/admin/payments' },
  { label: 'Manage Sessions', icon: Calendar, to: '/admin/sessions' },
  { label: 'View Users', icon: Users, to: '/admin/users' },
  { label: 'Analytics', icon: BarChart3, to: '/admin/analytics' },
];

const pendingTutors = [
  { id: 'p1', name: 'Anna Nghifindaka', university: 'UNAM', subjects: ['Law', 'Political Science'], status: 'pending' as const },
  { id: 'p2', name: 'David Shilongo', university: 'NUST', subjects: ['Engineering'], status: 'pending' as const },
];

const pendingPayments = [
  { id: 'pay1', studentName: 'Tusnelde Hamunyela', session: 'Mathematics Group', amount: 350, proof: 'proof.jpg' },
  { id: 'pay2', studentName: 'Leonard Iita', session: 'Chemistry 1-on-1', amount: 500, proof: 'receipt.png' },
];

export default function AdminDashboard() {
  return (
    <DashboardLayout title="Admin Dashboard" items={sidebarItems}>
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border bg-card p-5 shadow-card">
            <div className="flex items-center gap-2 text-sm text-muted-foreground"><Users className="h-4 w-4" />Total Students</div>
            <p className="mt-1 font-display text-2xl font-bold">156</p>
          </div>
          <div className="rounded-xl border bg-card p-5 shadow-card">
            <div className="flex items-center gap-2 text-sm text-muted-foreground"><GraduationCap className="h-4 w-4" />Total Tutors</div>
            <p className="mt-1 font-display text-2xl font-bold">{mockTutors.length}</p>
          </div>
          <div className="rounded-xl border bg-card p-5 shadow-card">
            <div className="flex items-center gap-2 text-sm text-muted-foreground"><BookOpen className="h-4 w-4" />Total Bookings</div>
            <p className="mt-1 font-display text-2xl font-bold">89</p>
          </div>
          <div className="rounded-xl border bg-card p-5 shadow-card">
            <div className="flex items-center gap-2 text-sm text-muted-foreground"><DollarSign className="h-4 w-4" />Revenue</div>
            <p className="mt-1 font-display text-2xl font-bold">N$34,500</p>
          </div>
        </div>

        {/* Pending Tutor Approvals */}
        <div>
          <h2 className="mb-4 font-display text-lg font-bold">Pending Tutor Approvals</h2>
          <div className="space-y-3">
            {pendingTutors.map(tutor => (
              <div key={tutor.id} className="flex flex-col gap-3 rounded-xl border bg-card p-4 shadow-card sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{tutor.name}</h3>
                    <StatusBadge status={tutor.status} />
                  </div>
                  <p className="text-sm text-muted-foreground">{tutor.university} · {tutor.subjects.join(', ')}</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm">Approve</Button>
                  <Button size="sm" variant="outline" className="text-destructive">Reject</Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pending Payments */}
        <div>
          <h2 className="mb-4 font-display text-lg font-bold">Pending Payment Confirmations</h2>
          <div className="space-y-3">
            {pendingPayments.map(payment => (
              <div key={payment.id} className="flex flex-col gap-3 rounded-xl border bg-card p-4 shadow-card sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="font-medium">{payment.studentName}</h3>
                  <p className="text-sm text-muted-foreground">{payment.session} · N${payment.amount}</p>
                  <p className="text-xs text-muted-foreground">Proof: {payment.proof}</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm">Confirm Payment</Button>
                  <Button size="sm" variant="outline">View Proof</Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
