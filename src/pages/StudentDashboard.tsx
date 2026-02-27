import { DashboardLayout } from '@/components/DashboardLayout';
import { StatusBadge } from '@/components/StatusBadge';
import { mockSessions } from '@/lib/mock-data';
import { BookOpen, Search, Bell, User, Calendar, MapPin, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const sidebarItems = [
  { label: 'My Bookings', icon: Calendar, to: '/student' },
  { label: 'Browse Tutors', icon: Search, to: '/browse' },
  { label: 'Notifications', icon: Bell, to: '/student/notifications' },
  { label: 'Profile Settings', icon: User, to: '/student/profile' },
];

export default function StudentDashboard() {
  // Mock bookings
  const bookings = [
    { id: 'b1', session: mockSessions[0], status: 'pending' as const, paymentStatus: 'pending' as const },
    { id: 'b2', session: mockSessions[2], status: 'confirmed' as const, paymentStatus: 'confirmed' as const },
  ];

  return (
    <DashboardLayout title="Student Dashboard" items={sidebarItems}>
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border bg-card p-5 shadow-card">
            <p className="text-sm text-muted-foreground">Active Bookings</p>
            <p className="mt-1 font-display text-2xl font-bold">2</p>
          </div>
          <div className="rounded-xl border bg-card p-5 shadow-card">
            <p className="text-sm text-muted-foreground">Completed Sessions</p>
            <p className="mt-1 font-display text-2xl font-bold">5</p>
          </div>
          <div className="rounded-xl border bg-card p-5 shadow-card">
            <p className="text-sm text-muted-foreground">Total Spent</p>
            <p className="mt-1 font-display text-2xl font-bold">N$2,100</p>
          </div>
        </div>

        {/* Bookings */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-bold">My Bookings</h2>
            <Button size="sm" asChild><Link to="/browse">Browse Tutors</Link></Button>
          </div>
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div key={booking.id} className="rounded-xl border bg-card p-5 shadow-card">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-display font-bold">{booking.session.subject}</h3>
                      <StatusBadge status={booking.status} />
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">with {booking.session.tutorName}</p>
                    <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{booking.session.location}</span>
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{booking.session.date}</span>
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{booking.session.time}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-display text-lg font-bold text-accent">N${booking.session.price}</p>
                    <p className="text-xs text-muted-foreground">Payment: {booking.paymentStatus}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
