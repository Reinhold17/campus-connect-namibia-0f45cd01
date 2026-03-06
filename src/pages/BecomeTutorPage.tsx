import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/integrations/supabase/client';
import { GraduationCap, CheckCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Navigate } from 'react-router-dom';

export default function BecomeTutorPage() {
  const { user, profile, isAuthenticated, loading: authLoading } = useAuth();
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!authLoading && !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;

    setSubmitting(true);
    try {
      const form = e.currentTarget;
      const formData = new FormData(form);

      const university = formData.get('university') as string;
      const yearOfStudy = formData.get('yearOfStudy') as string;
      const subjects = (formData.get('subjects') as string).split(',').map(s => s.trim()).filter(Boolean);
      const bio = formData.get('bio') as string;
      const name = formData.get('fullName') as string;
      const email = formData.get('email') as string;

      // Update profile with tutor info and set status to pending
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          name,
          university,
          year_of_study: yearOfStudy,
          subjects,
          bio,
          status: 'pending',
        })
        .eq('user_id', user.id);

      if (profileError) throw profileError;

      // Upload transcript if provided
      const transcriptFile = formData.get('transcript') as File;
      if (transcriptFile && transcriptFile.size > 0) {
        const filePath = `transcripts/${user.id}/${transcriptFile.name}`;
        await supabase.storage
          .from('payment-proofs')
          .upload(filePath, transcriptFile, { upsert: true });
      }

      // Notify admin via edge function
      try {
        await supabase.functions.invoke('notify-admin-tutor-signup', {
          body: { tutorName: name, tutorEmail: email, university, subjects },
        });
      } catch {
        // Non-critical — don't block submission if notification fails
        console.warn('Admin notification failed');
      }

      setSubmitted(true);
      toast.success('Application submitted successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit application');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center px-4 py-20">
          <div className="max-w-md text-center">
            <CheckCircle className="mx-auto h-16 w-16 text-success" />
            <h1 className="mt-4 font-display text-2xl font-bold">Application Submitted!</h1>
            <p className="mt-2 text-muted-foreground">Our admin team will review your application and get back to you shortly. You'll be notified once approved.</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto max-w-2xl px-4 py-10">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary">
            <GraduationCap className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="font-display text-2xl font-bold">Become a Tutor</h1>
          <p className="mt-1 text-sm text-muted-foreground">Share your knowledge and earn while helping fellow students</p>
        </div>

        <form
          className="space-y-4 rounded-xl border bg-card p-6 shadow-card"
          onSubmit={handleSubmit}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="fullName">Full Name</Label>
              <Input id="fullName" name="fullName" defaultValue={profile?.name || ''} required />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" defaultValue={user?.email || ''} required />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="university">University</Label>
              <Input id="university" name="university" placeholder="e.g. University of Namibia" required />
            </div>
            <div>
              <Label htmlFor="yearOfStudy">Year of Study</Label>
              <Input id="yearOfStudy" name="yearOfStudy" placeholder="e.g. 3rd Year" required />
            </div>
          </div>
          <div>
            <Label htmlFor="subjects">Subjects (comma-separated)</Label>
            <Input id="subjects" name="subjects" placeholder="Mathematics, Physics, Chemistry" required />
          </div>
          <div>
            <Label htmlFor="bio">Short Bio</Label>
            <Textarea id="bio" name="bio" placeholder="Tell students about your tutoring experience and approach..." rows={4} required />
          </div>
          <div>
            <Label htmlFor="transcript">Academic Transcript (PDF)</Label>
            <Input id="transcript" name="transcript" type="file" accept=".pdf,.jpg,.png" />
            <p className="mt-1 text-xs text-muted-foreground">Upload your transcript for verification</p>
          </div>
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Submit Application
          </Button>
        </form>
      </div>
      <Footer />
    </div>
  );
}
