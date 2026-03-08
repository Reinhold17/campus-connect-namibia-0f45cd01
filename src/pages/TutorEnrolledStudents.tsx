import { DashboardLayout } from '@/components/DashboardLayout';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/integrations/supabase/client';
import { CalendarPlus, Calendar, Users, Star, Bell, User, Loader2, Sparkles, BookOpen, Mail } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { StatusBadge } from '@/components/StatusBadge';

const sidebarItems = [
  { label: 'My Sessions', icon: Calendar, to: '/tutor' },
  { label: 'Create Session', icon: CalendarPlus, to: '/tutor/create' },
  { label: 'AI Lesson Planner', icon: Sparkles, to: '/tutor/lesson-planner' },
  { label: 'Enrolled Students', icon: Users, to: '/tutor/students' },
  { label: 'Ratings', icon: Star, to: '/tutor/ratings' },
  { label: 'Notifications', icon: Bell, to: '/tutor/notifications' },
  { label: 'Profile', icon: User, to: '/tutor/profile' },
];

interface EnrolledStudent {
  bookingId: string;
  studentName: string;
  studentEmail: string;
  sessionSubject: string;
  sessionDate: string;
  sessionTime: string;
  sessionPrice: number;
  paymentStatus: string;
  bookingStatus: string;
}

export default function TutorEnrolledStudents() {
  const { user } = useAuth();

  const { data: enrolledStudents = [], isLoading } = useQuery({
    queryKey: ['tutor-enrolled-students', user?.id],
    queryFn: async () => {
      // First get tutor's sessions
      const { data: sessions, error: sessError } = await supabase
        .from('sessions')
        .select('id, subject, date, time, price')
        .eq('tutor_id', user!.id);
      if (sessError) throw sessError;
      if (!sessions || sessions.length === 0) return [];

      // Get bookings for those sessions
      const { data: bookings, error: bookError } = await supabase
        .from('bookings')
        .select('id, student_id, session_id, payment_status, status')
        .in('session_id', sessions.map(s => s.id))
        .neq('status', 'cancelled');
      if (bookError) throw bookError;
      if (!bookings || bookings.length === 0) return [];

      // Get student profiles
      const studentIds = [...new Set(bookings.map(b => b.student_id))];
      const { data: profiles, error: profError } = await supabase
        .from('profiles')
        .select('user_id, name, email')
        .in('user_id', studentIds);
      if (profError) throw profError;

      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);
      const sessionMap = new Map(sessions.map(s => [s.id, s]));

      const result: EnrolledStudent[] = bookings.map(b => {
        const profile = profileMap.get(b.student_id);
        const session = sessionMap.get(b.session_id);
        return {
          bookingId: b.id,
          studentName: profile?.name || 'Unknown',
          studentEmail: profile?.email || 'N/A',
          sessionSubject: session?.subject || 'Unknown',
          sessionDate: session?.date || '',
          sessionTime: session?.time || '',
          sessionPrice: session?.price || 0,
          paymentStatus: b.payment_status,
          bookingStatus: b.status,
        };
      });

      return result;
    },
    enabled: !!user,
  });

  return (
    <DashboardLayout title="Enrolled Students" items={sidebarItems}>
      <div className="space-y-6">
        <div>
          <h2 className="font-display text-xl font-bold">Enrolled Students</h2>
          <p className="text-sm text-muted-foreground">View students who have booked your sessions</p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Loading students...</span>
          </div>
        ) : enrolledStudents.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-border bg-muted/30 p-12 text-center">
            <div className="mx-auto mb-4 inline-flex rounded-2xl bg-gradient-to-br from-primary to-[hsl(217,60%,38%)] p-4 text-primary-foreground shadow-lg">
              <Users className="h-8 w-8" />
            </div>
            <h3 className="font-display text-lg font-bold">No enrolled students yet</h3>
            <p className="mt-2 text-sm text-muted-foreground">Students will appear here once they book your sessions.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {enrolledStudents.map((student, i) => (
              <div
                key={student.bookingId}
                className="group flex flex-col gap-4 rounded-2xl border bg-card p-5 shadow-card transition-all duration-300 hover:shadow-elevated hover:border-primary/20 sm:flex-row sm:items-center sm:justify-between animate-fade-in"
                style={{ animationDelay: `${i * 60}ms`, animationFillMode: 'backwards' }}
              >
                <div className="flex items-start gap-4 min-w-0">
                  <div className="hidden sm:flex shrink-0 h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 text-primary">
                    <User className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-display font-bold truncate text-base">{student.studentName}</h3>
                    <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="h-3.5 w-3.5" />
                      <span className="truncate">{student.studentEmail}</span>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <BookOpen className="h-3.5 w-3.5" />
                        {student.sessionSubject}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {student.sessionDate}
                      </span>
                      <span>at {student.sessionTime}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 sm:shrink-0">
                  <StatusBadge status={student.paymentStatus === 'confirmed' ? 'confirmed' : student.paymentStatus as any} />
                  <div className="rounded-full bg-muted px-3 py-1 text-xs font-medium">
                    N${student.sessionPrice}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
