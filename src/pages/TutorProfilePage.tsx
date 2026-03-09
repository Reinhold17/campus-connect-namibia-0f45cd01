import { useParams, useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { RatingStars } from '@/components/RatingStars';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { GraduationCap, BookOpen, Calendar, Clock, Users, Loader2 } from 'lucide-react';
import { VerifiedBadge, isTutorVerified } from '@/components/VerifiedBadge';
import { TutorPhotoGallery } from '@/components/TutorPhotoGallery';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';

export default function TutorProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, role } = useAuth();

  const { data: tutor, isLoading: tutorLoading } = useQuery({
    queryKey: ['tutor-profile', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', id!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: sessions = [] } = useQuery({
    queryKey: ['tutor-sessions', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sessions')
        .select('*, module:modules!sessions_module_id_fkey ( name )')
        .eq('tutor_id', id!)
        .eq('status', 'active')
        .gte('date', new Date().toISOString().split('T')[0]);
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: bookingCounts = {} } = useQuery({
    queryKey: ['session-booking-counts', id],
    queryFn: async () => {
      if (sessions.length === 0) return {};
      const { data, error } = await supabase
        .from('bookings')
        .select('session_id')
        .in('session_id', sessions.map(s => s.id))
        .neq('status', 'cancelled');
      if (error) throw error;
      const counts: Record<string, number> = {};
      data.forEach(b => { counts[b.session_id] = (counts[b.session_id] || 0) + 1; });
      return counts;
    },
    enabled: sessions.length > 0,
  });

  const handleBook = (sessionId: string) => {
    if (!isAuthenticated) {
      toast.info('Please sign up or log in to book a session');
      navigate('/signup');
      return;
    }
    if (role !== 'student') {
      toast.error('Only students can book sessions');
      return;
    }
    navigate(`/payment/${sessionId}`);
  };

  if (tutorLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!tutor) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <p className="text-muted-foreground">Tutor not found.</p>
        </div>
      </div>
    );
  }

  const initials = tutor.name.split(' ').map((n: string) => n[0]).join('');

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-10">
        {/* Profile header */}
        <div className="rounded-xl border bg-card p-6 shadow-card md:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-start">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-primary font-display text-2xl font-bold text-primary-foreground">
              {initials}
            </div>
            <div className="flex-1">
              <h1 className="font-display text-2xl font-bold md:text-3xl">
                {tutor.name}
                {isTutorVerified(tutor) && (
                  <span className="ml-2 inline-block align-middle"><VerifiedBadge size="lg" showLabel /></span>
                )}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                {tutor.university && <span className="flex items-center gap-1"><GraduationCap className="h-4 w-4" />{tutor.university}</span>}
                <RatingStars rating={tutor.rating || 0} />
                <span>({tutor.review_count || 0} reviews)</span>
              </div>
              {tutor.bio && <p className="mt-4 text-muted-foreground">{tutor.bio}</p>}
              {tutor.subjects && tutor.subjects.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {tutor.subjects.map((s: string) => (
                    <Badge key={s} variant="secondary"><BookOpen className="mr-1 h-3 w-3" />{s}</Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sessions */}
        <div className="mt-8">
          <h2 className="mb-4 font-display text-xl font-bold">Available Sessions</h2>
          {sessions.length === 0 ? (
            <p className="text-muted-foreground">No upcoming sessions available.</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {sessions.map(session => {
                const enrolled = bookingCounts[session.id] || 0;
                const isFull = session.type === 'group' && enrolled >= session.max_students;
                return (
                  <div key={session.id} className="rounded-xl border bg-card p-5 shadow-card">
                    <div className="flex items-center justify-between">
                      <Badge variant={session.type === 'one-on-one' ? 'default' : 'secondary'}>
                        {session.type === 'one-on-one' ? '1-on-1' : 'Group'}
                      </Badge>
                      <Badge variant="outline" className="text-xs gap-1">
                        <Users className="h-3 w-3" />
                        {enrolled}/{session.max_students} enrolled
                      </Badge>
                    </div>
                    <h3 className="mt-3 font-display text-lg font-bold">{session.module?.name || session.subject}</h3>
                    <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                      <p className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" />{session.date}</p>
                      <p className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" />{session.time}</p>
                    </div>
                    <Button
                      className="mt-4 w-full"
                      size="sm"
                      disabled={isFull}
                      onClick={() => handleBook(session.id)}
                    >
                      {isFull ? 'Session Full' : isAuthenticated ? 'Book Tutor' : 'Sign Up to Book'}
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
