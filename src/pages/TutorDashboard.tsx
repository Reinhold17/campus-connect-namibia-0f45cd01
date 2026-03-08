import { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { StatusBadge } from '@/components/StatusBadge';
import { RatingStars } from '@/components/RatingStars';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/integrations/supabase/client';
import { CalendarPlus, Calendar, Users, Star, Bell, User, Loader2, Sparkles } from 'lucide-react';
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
  { label: 'Enrolled Students', icon: Users, to: '/tutor/students' },
  { label: 'Ratings', icon: Star, to: '/tutor/ratings' },
  { label: 'Notifications', icon: Bell, to: '/tutor/notifications' },
  { label: 'Profile', icon: User, to: '/tutor/profile' },
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

  return (
    <DashboardLayout title="Tutor Dashboard" items={sidebarItems}>
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          <div className="rounded-xl border bg-card p-5 shadow-card">
            <p className="text-sm text-muted-foreground">Active Sessions</p>
            <p className="mt-1 font-display text-2xl font-bold">{sessions.filter(s => s.status === 'active').length}</p>
          </div>
          <div className="rounded-xl border bg-card p-5 shadow-card">
            <p className="text-sm text-muted-foreground">Total Students</p>
            <p className="mt-1 font-display text-2xl font-bold">{totalStudents}</p>
          </div>
          <div className="rounded-xl border bg-card p-5 shadow-card">
            <p className="text-sm text-muted-foreground">Average Rating</p>
            <p className="mt-1 font-display text-2xl font-bold">{profile?.rating || 0}</p>
          </div>
          <div className="rounded-xl border bg-card p-5 shadow-card">
            <p className="text-sm text-muted-foreground">Total Earnings</p>
            <p className="mt-1 font-display text-2xl font-bold">N$0</p>
          </div>
        </div>

        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-bold">My Sessions</h2>
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-1"><CalendarPlus className="h-4 w-4" /> Create Session</Button>
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
            <p className="text-muted-foreground">Loading sessions...</p>
          ) : sessions.length === 0 ? (
            <p className="text-muted-foreground">No sessions created yet. Click "Create Session" to get started.</p>
          ) : (
            <div className="space-y-3">
              {sessions.map(session => (
                <div key={session.id} className="flex flex-col gap-2 rounded-xl border bg-card p-4 shadow-card sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <h3 className="font-display font-bold truncate">{session.subject}</h3>
                    <p className="text-sm text-muted-foreground">{session.date} at {session.time}</p>
                    <p className="text-xs text-muted-foreground truncate">{session.location}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={session.status === 'active' ? 'confirmed' : session.status as any} />
                    <span className="text-sm text-muted-foreground">{bookingCounts[session.id] || 0}/{session.max_students}</span>
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
