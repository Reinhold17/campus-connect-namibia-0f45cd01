import { DashboardLayout } from '@/components/DashboardLayout';
import { StatusBadge } from '@/components/StatusBadge';
import { RatingStars } from '@/components/RatingStars';
import { mockSessions, mockReviews } from '@/lib/mock-data';
import { CalendarPlus, Calendar, Users, Star, Bell, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

const sidebarItems = [
  { label: 'My Sessions', icon: Calendar, to: '/tutor' },
  { label: 'Create Session', icon: CalendarPlus, to: '/tutor/create' },
  { label: 'Enrolled Students', icon: Users, to: '/tutor/students' },
  { label: 'Ratings', icon: Star, to: '/tutor/ratings' },
  { label: 'Notifications', icon: Bell, to: '/tutor/notifications' },
  { label: 'Profile', icon: User, to: '/tutor/profile' },
];

export default function TutorDashboard() {
  const tutorSessions = mockSessions.filter(s => s.tutorId === '1');

  return (
    <DashboardLayout title="Tutor Dashboard" items={sidebarItems}>
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-4">
          <div className="rounded-xl border bg-card p-5 shadow-card">
            <p className="text-sm text-muted-foreground">Active Sessions</p>
            <p className="mt-1 font-display text-2xl font-bold">{tutorSessions.length}</p>
          </div>
          <div className="rounded-xl border bg-card p-5 shadow-card">
            <p className="text-sm text-muted-foreground">Total Students</p>
            <p className="mt-1 font-display text-2xl font-bold">12</p>
          </div>
          <div className="rounded-xl border bg-card p-5 shadow-card">
            <p className="text-sm text-muted-foreground">Average Rating</p>
            <p className="mt-1 font-display text-2xl font-bold">4.8</p>
          </div>
          <div className="rounded-xl border bg-card p-5 shadow-card">
            <p className="text-sm text-muted-foreground">Total Earnings</p>
            <p className="mt-1 font-display text-2xl font-bold">N$4,200</p>
          </div>
        </div>

        <div>
          <h2 className="mb-4 font-display text-lg font-bold">My Sessions</h2>
          <div className="space-y-3">
            {tutorSessions.map(session => (
              <div key={session.id} className="flex items-center justify-between rounded-xl border bg-card p-4 shadow-card">
                <div>
                  <h3 className="font-display font-bold">{session.subject}</h3>
                  <p className="text-sm text-muted-foreground">{session.date} at {session.time} · {session.location}</p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status="confirmed" />
                  <span className="text-sm text-muted-foreground">{session.enrolledStudents.length}/{session.maxStudents}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="mb-4 font-display text-lg font-bold">Recent Reviews</h2>
          <div className="space-y-3">
            {mockReviews.filter(r => r.tutorId === '1').map(review => (
              <div key={review.id} className="rounded-xl border bg-card p-4 shadow-card">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{review.studentName}</span>
                  <RatingStars rating={review.rating} />
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{review.comment}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
