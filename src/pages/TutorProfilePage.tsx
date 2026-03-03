import { useParams, Link, useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { RatingStars } from '@/components/RatingStars';
import { StatusBadge } from '@/components/StatusBadge';
import { useAuth } from '@/lib/auth-context';
import { mockTutors, mockSessions, mockReviews } from '@/lib/mock-data';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { GraduationCap, MapPin, BookOpen, Calendar, Clock, Users, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

export default function TutorProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, role } = useAuth();
  const tutor = mockTutors.find(t => t.id === id);
  const sessions = mockSessions.filter(s => s.tutorId === id);
  const reviews = mockReviews.filter(r => r.tutorId === id);

  const handleBook = () => {
    if (!isAuthenticated) {
      toast.info('Please sign up or log in to book a session');
      navigate('/signup');
      return;
    }
    if (role !== 'student') {
      toast.error('Only students can book sessions');
      return;
    }
    toast.success('Booking request sent!');
  };

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

  const initials = tutor.name.split(' ').map(n => n[0]).join('');
  const canOffer1on1 = (tutor.rating || 0) >= 4.5;

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
              <h1 className="font-display text-2xl font-bold md:text-3xl">{tutor.name}</h1>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><GraduationCap className="h-4 w-4" />{tutor.university}</span>
                <RatingStars rating={tutor.rating || 0} />
                <span>({tutor.reviewCount} reviews)</span>
              </div>
              <p className="mt-4 text-muted-foreground">{tutor.bio}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {tutor.subjects?.map(s => (
                  <Badge key={s} variant="secondary"><BookOpen className="mr-1 h-3 w-3" />{s}</Badge>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sessions */}
        <div className="mt-8">
          <h2 className="mb-4 font-display text-xl font-bold">Available Sessions</h2>
          {!canOffer1on1 && (
            <div className="mb-4 flex items-center gap-2 rounded-lg border border-warning/30 bg-warning/10 p-3 text-sm text-warning">
              <AlertTriangle className="h-4 w-4" />
              Tutor not yet eligible for 1-on-1 sessions (requires rating ≥ 4.5)
            </div>
          )}
          {sessions.length === 0 ? (
            <p className="text-muted-foreground">No upcoming sessions available.</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {sessions.map(session => (
                <div key={session.id} className="rounded-xl border bg-card p-5 shadow-card">
                  <div className="flex items-center justify-between">
                    <Badge variant={session.type === 'one-on-one' ? 'default' : 'secondary'}>
                      {session.type === 'one-on-one' ? '1-on-1' : 'Group'}
                    </Badge>
                    <span className="font-display text-lg font-bold text-accent">N${session.price}</span>
                  </div>
                  <h3 className="mt-3 font-display text-lg font-bold">{session.subject}</h3>
                  <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                    <p className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" />{session.location}</p>
                    <p className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" />{session.date}</p>
                    <p className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" />{session.time}</p>
                    {session.type === 'group' && (
                      <p className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5" />{session.enrolledStudents.length}/{session.maxStudents} enrolled</p>
                    )}
                  </div>
                  <Button className="mt-4 w-full" size="sm" onClick={handleBook}>
                    {isAuthenticated ? 'Book This Session' : 'Sign Up to Book'}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Reviews */}
        <div className="mt-8">
          <h2 className="mb-4 font-display text-xl font-bold">Reviews</h2>
          {reviews.length === 0 ? (
            <p className="text-muted-foreground">No reviews yet.</p>
          ) : (
            <div className="space-y-4">
              {reviews.map(review => (
                <div key={review.id} className="rounded-xl border bg-card p-5 shadow-card">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{review.studentName}</span>
                    <RatingStars rating={review.rating} />
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{review.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
