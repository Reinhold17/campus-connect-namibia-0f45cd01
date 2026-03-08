import { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { StatusBadge } from '@/components/StatusBadge';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/integrations/supabase/client';
import { CalendarPlus, Calendar, Users, Star, Bell, User, Loader2, Sparkles, TrendingUp, DollarSign, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

const sidebarItems = [
  { label: 'My Sessions', icon: Calendar, to: '/tutor' },
  { label: 'Create Session', icon: CalendarPlus, to: '/tutor/create' },
  { label: 'AI Lesson Planner', icon: Sparkles, to: '/tutor/lesson-planner' },
  { label: 'Enrolled Students', icon: Users, to: '/tutor/students' },
  { label: 'Ratings', icon: Star, to: '/tutor/ratings' },
  { label: 'Notifications', icon: Bell, to: '/tutor/notifications' },
  { label: 'Profile', icon: User, to: '/tutor/profile' },
];

const statCards = [
  {
    key: 'sessions',
    label: 'Active Sessions',
    icon: BookOpen,
    gradient: 'from-[hsl(217,72%,28%)] to-[hsl(217,60%,42%)]',
    iconBg: 'bg-[hsl(217,72%,28%/0.2)]',
  },
  {
    key: 'students',
    label: 'Total Students',
    icon: Users,
    gradient: 'from-[hsl(142,71%,35%)] to-[hsl(142,60%,45%)]',
    iconBg: 'bg-[hsl(142,71%,35%/0.2)]',
  },
  {
    key: 'rating',
    label: 'Average Rating',
    icon: Star,
    gradient: 'from-[hsl(39,90%,55%)] to-[hsl(45,95%,60%)]',
    iconBg: 'bg-[hsl(39,90%,55%/0.2)]',
  },
  {
    key: 'earnings',
    label: 'Total Earnings',
    icon: DollarSign,
    gradient: 'from-[hsl(270,60%,50%)] to-[hsl(280,70%,60%)]',
    iconBg: 'bg-[hsl(270,60%,50%/0.2)]',
  },
];

export default function TutorDashboard() {
  const { user, profile } = useAuth();
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);

  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ['tutor-my-sessions', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .eq('tutor_id', user!.id)
        .order('date', { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: bookingCounts = {} } = useQuery({
    queryKey: ['tutor-booking-counts', user?.id],
    queryFn: async () => {
      if (sessions.length === 0) return {};
      const { data, error } = await supabase
        .from('bookings')
        .select('session_id, status')
        .in('session_id', sessions.map(s => s.id))
        .neq('status', 'cancelled');
      if (error) throw error;
      const counts: Record<string, number> = {};
      data.forEach(b => { counts[b.session_id] = (counts[b.session_id] || 0) + 1; });
      return counts;
    },
    enabled: sessions.length > 0,
  });

  const totalStudents = Object.values(bookingCounts).reduce((a, b) => a + b, 0);

  const statValues: Record<string, string | number> = {
    sessions: sessions.filter(s => s.status === 'active').length,
    students: totalStudents,
    rating: profile?.rating || 0,
    earnings: 'N$0',
  };

  return (
    <DashboardLayout title="Tutor Dashboard" items={sidebarItems}>
      <div className="space-y-8">
        {/* Welcome Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-hero-gradient p-6 text-primary-foreground shadow-elevated sm:p-8">
          <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-[hsl(39,90%,55%/0.1)] blur-2xl" />
          <div className="absolute -bottom-4 -left-4 h-32 w-32 rounded-full bg-[hsl(39,90%,55%/0.08)] blur-xl" />
          <div className="relative">
            <p className="text-sm font-medium text-primary-foreground/70">Welcome back,</p>
            <h2 className="mt-1 font-display text-2xl font-bold sm:text-3xl">{profile?.name || 'Tutor'} 👋</h2>
            <p className="mt-2 max-w-lg text-sm text-primary-foreground/60">
              Manage your sessions, track your students, and grow your tutoring career.
            </p>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {statCards.map((card, i) => (
            <div
              key={card.key}
              className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card p-5 shadow-card transition-all duration-300 hover:shadow-elevated hover:-translate-y-1 animate-fade-in"
              style={{ animationDelay: `${i * 80}ms`, animationFillMode: 'backwards' }}
            >
              <div className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <div className={`h-full w-full bg-gradient-to-br ${card.gradient} opacity-[0.04]`} />
              </div>
              <div className="relative">
                <div className={`mb-3 inline-flex rounded-xl bg-gradient-to-br ${card.gradient} p-2.5 text-primary-foreground shadow-md`}>
                  <card.icon className="h-5 w-5" />
                </div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{card.label}</p>
                <p className="mt-1 font-display text-3xl font-bold tracking-tight">{statValues[card.key]}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Sessions List */}
        <div>
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="font-display text-xl font-bold">My Sessions</h2>
              <p className="text-sm text-muted-foreground">Manage and track your tutoring sessions</p>
            </div>
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-2 bg-gradient-to-r from-primary to-[hsl(217,60%,38%)] shadow-md hover:shadow-lg transition-all duration-200">
                  <CalendarPlus className="h-4 w-4" /> Create Session
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Session</DialogTitle>
                </DialogHeader>
                <CreateSessionForm
                  tutorId={user!.id}
                  canOffer1on1={(profile?.rating || 0) >= 4.5}
                  onCreated={() => {
                    setCreateOpen(false);
                    queryClient.invalidateQueries({ queryKey: ['tutor-my-sessions'] });
                  }}
                />
              </DialogContent>
            </Dialog>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">Loading sessions...</span>
            </div>
          ) : sessions.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-border bg-muted/30 p-12 text-center">
              <div className="mx-auto mb-4 inline-flex rounded-2xl bg-gradient-to-br from-primary to-[hsl(217,60%,38%)] p-4 text-primary-foreground shadow-lg">
                <CalendarPlus className="h-8 w-8" />
              </div>
              <h3 className="font-display text-lg font-bold">No sessions yet</h3>
              <p className="mt-2 text-sm text-muted-foreground">Create your first session to start tutoring students.</p>
              <Button className="mt-4 gap-2" onClick={() => setCreateOpen(true)}>
                <CalendarPlus className="h-4 w-4" /> Create Session
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {sessions.map((session, i) => (
                <div
                  key={session.id}
                  className="group flex flex-col gap-3 rounded-2xl border bg-card p-5 shadow-card transition-all duration-300 hover:shadow-elevated hover:border-primary/20 sm:flex-row sm:items-center sm:justify-between animate-fade-in"
                  style={{ animationDelay: `${i * 60}ms`, animationFillMode: 'backwards' }}
                >
                  <div className="flex items-start gap-4 min-w-0">
                    <div className="hidden sm:flex shrink-0 h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 text-primary">
                      <BookOpen className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-display font-bold truncate text-base">{session.subject}</h3>
                      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {session.date}
                        </span>
                        <span>at {session.time}</span>
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground truncate">{session.location}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 sm:shrink-0">
                    <StatusBadge status={session.status === 'active' ? 'confirmed' : session.status as any} />
                    <div className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-medium">
                      <Users className="h-3 w-3 text-muted-foreground" />
                      <span>{bookingCounts[session.id] || 0}/{session.max_students}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

function CreateSessionForm({ tutorId, canOffer1on1, onCreated }: { tutorId: string; canOffer1on1: boolean; onCreated: () => void }) {
  const [subject, setSubject] = useState('');
  const [type, setType] = useState('group');
  const [price, setPrice] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [maxStudents, setMaxStudents] = useState('10');

  const createMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('sessions').insert({
        tutor_id: tutorId,
        subject,
        type,
        price: parseFloat(price),
        location,
        date,
        time,
        max_students: type === 'one-on-one' ? 1 : parseInt(maxStudents),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Session created!');
      onCreated();
    },
    onError: (err: any) => toast.error(err.message),
  });

  return (
    <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(); }} className="space-y-4">
      <div>
        <Label>Subject</Label>
        <Input value={subject} onChange={e => setSubject(e.target.value)} placeholder="e.g. Financial Accounting 1" required />
      </div>
      <div>
        <Label>Session Type</Label>
        <Select value={type} onValueChange={setType}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="group">Group</SelectItem>
            <SelectItem value="one-on-one" disabled={!canOffer1on1}>
              1-on-1 {!canOffer1on1 && '(requires ≥4.5 rating)'}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Price (N$)</Label>
          <Input type="number" min="0" value={price} onChange={e => setPrice(e.target.value)} required />
        </div>
        {type === 'group' && (
          <div>
            <Label>Max Students</Label>
            <Input type="number" min="2" value={maxStudents} onChange={e => setMaxStudents(e.target.value)} required />
          </div>
        )}
      </div>
      <div>
        <Label>Location</Label>
        <Input value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g. UNAM Library Room 2" required />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Date</Label>
          <Input type="date" value={date} onChange={e => setDate(e.target.value)} required />
        </div>
        <div>
          <Label>Time</Label>
          <Input type="time" value={time} onChange={e => setTime(e.target.value)} required />
        </div>
      </div>
      <Button type="submit" className="w-full" disabled={createMutation.isPending}>
        {createMutation.isPending ? 'Creating...' : 'Create Session'}
      </Button>
    </form>
  );
}
